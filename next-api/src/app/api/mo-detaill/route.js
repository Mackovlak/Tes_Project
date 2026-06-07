import { NextResponse } from "next/server";

import prisma  from "../../../../prisma/client";

import redis, { deleteByPattern, redisKey } from "../../../../lib/redis";
export async function GET(request) {
    try{
        // Ambil parameter pencarian & pagination
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        const WOID = searchParams.get("WOID") ? (searchParams.get("WOID")) : null;

        const mode = searchParams.get("mode") ?? "paginated";
      
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        const skip = Math.max(0, parseInt(searchParams.get("skip") ?? "0", 10));
        const take = Math.min(200, Math.max(1, parseInt(searchParams.get("take") ?? "20", 10)));

        const sortBy = searchParams.get("sortBy") ?? "CreatedOn";
        const sortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";
        const orderBy = { [sortBy]: sortDir };

        const baseConditions = [];

        if (WOID !== null) {
            baseConditions.push({ WOID: WOID });
        }
        
        if (search) {
            baseConditions.push({
                OR: [
                    { OrderNumber: { contains: search } },
                    { MOID: { contains: search } },
                    { workorder: { WOID: { contains: search } } }
                ]
            });
        }
        const orderStatus = searchParams.get("OrderStatus");
        if (orderStatus) baseConditions.push({ OrderStatus: orderStatus });
        
        const whereCondition = baseConditions.length > 0
            ? { AND: baseConditions }
            : {};      

        const sortedParams = new URLSearchParams([...searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)));
        const cacheKey = redisKey(`materialorder:list:${sortedParams.toString()}`);
        const cached = await redis.get(cacheKey);
        
        if (cached) {
            return NextResponse.json(JSON.parse(cached), { status: 200 });
        }


        const [totalCount, materialorder] = await Promise.all([
            prisma.materialorder.count({ where: whereCondition }),
            prisma.materialorder.findMany({
                where: whereCondition,
                skip: skip,
                take: take,
                orderBy: orderBy,
                include: {
                  workorder: {
                      include: {
                          caseinformation: {
                              include : {
                                  ActionLog: true,
                              }
                          }
                      }
                  },
                  materialorderlineitems: true,
                  owner: true,
                }
            })
        ]);
        const response = {
            success: true,
            message: "List Data Material Order Information",
            data: materialorder.map(m => ({
                    ...m,
                    Owner: m.owner ? m.owner.Name : "-",
                    workorder: {
                        ...m.workorder,
                        caseinformation: {
                        ...m.workorder.caseinformation,
                        UpdatedActionLogs: m.workorder.caseinformation?.ActionLog
                            ?.filter(log => log.dataOld !== log.dataNew && log.model !== "CaseOwner")
                            ?.map(log => ({
                            ChangeAt: log.ChangeAt,
                            ChangedBy: log.ChangedBy,
                            dataOld: log.dataOld,
                            dataNew: log.dataNew,
                            logDescription: log.logDescription
                            })) || []
                        }
                    }
                    })),
            total:totalCount,
            skip,
            take,
        };

        await redis.set(cacheKey, JSON.stringify(response), "EX", 120);

        return NextResponse.json(
          response,
        {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*", // Allow all origins
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
    } catch (error) {
        console.error("🔥 ERROR in GET API:", error);

        return NextResponse.json({
            success: false,
            message: "Failed to fetch data",
            error: error.message
        }, { status: 500 });
    }
}


/**
 * TODO 
 * MAKE CREATE ASSET AND CREATE PRODUCT SEPARATELY
 */
export async function POST(request) {
    //get all request
    const { 
        WOID,
        OrderNumber,
        OrderStatus,
        OrderType,
        CreatedON,
        SalesOrderNumber,
        RMANumber,
        ReadyForClosureDate,
        Owner,
    } = await request.json();

    //create data 
    const materialorder = await prisma.materialorder.create({
        data:{
            WOID: WOID,
            OrderNumber: OrderNumber,
            OrderStatus: OrderStatus,
            OrderType: OrderType,
            CreatedON: CreatedON,
            SalesOrderNumber: SalesOrderNumber,
            RMANumber: RMANumber,
            ReadyForClosureDate: ReadyForClosureDate,
            Owner: Owner
        },
    });

    return NextResponse.json(
        {
            success: true,
            message: "Material Order Information Created Successfully!",
            data: materialorder,
        },
        { 
            status: 201
        }
    )
}
