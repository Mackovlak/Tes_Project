import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
import redis, { deleteByPattern, redisKey } from "../../../../lib/redis";

export async function GET(request) {
    try{
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const caseID = searchParams.get("CaseID") || "";
        
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        const skip = Math.max(0, parseInt(searchParams.get("skip") ?? "0", 10));
        const take = Math.min(200, Math.max(1, parseInt(searchParams.get("take") ?? "20", 10)));

        const sortBy = searchParams.get("sortBy") ?? "CreatedOn";
        const sortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";
        const orderBy = { [sortBy]: sortDir };

        const baseConditions = [];
         
        if (search) {
            baseConditions.push({
             OR:[
                {
                WOID: { contains: search },
                },
                {
                CaseID: { contains: search },
                },
                {
                owner: { Name: {contains: search}}
                }
            ]});
        }

        if (caseID) {
            baseConditions.push({CaseID: caseID});
        };

        const systemStatus = searchParams.get("SystemStatus");
        if (systemStatus) baseConditions.push({ SystemStatus: systemStatus });

        const whereCondition = baseConditions.length > 0
            ? { AND: baseConditions }
            : {};      

        const sortedParams = new URLSearchParams([...searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)));
        const cacheKey = redisKey(`workorder:list:${sortedParams.toString()}`);
        const cached = await redis.get(cacheKey);
        
        if (cached) {
            return NextResponse.json(JSON.parse(cached), { status: 200 });
        }


        const [totalCount, workorder] = await Promise.all([
            prisma.workorder.count({ where: whereCondition }),
            prisma.workorder.findMany({
                where: whereCondition,
                skip: skip,
                take: take,
                orderBy: orderBy,
                include: {
                  caseinformation: {
                      include: {
                          site_account: true,
                          contact_information: true,
                      },
                  },
                  owner: true,
                }
            })
        ]);

        const response = {
            success: true,
            message: "List Data Work Order",
            data: workorder,
            total:totalCount,
            skip,
            take,
        };

        await redis.set(cacheKey, JSON.stringify(response), "EX", 120);

          

        return NextResponse.json(
          response,
          {
          status: 200,
        });
    }catch(err){
        console.error("🔥 ERROR in GET API:", err);

        return NextResponse.json({
            success: false,
            message: "Failed to fetch data",
            error: err.message
        }, { status: 500 });
    }
}
