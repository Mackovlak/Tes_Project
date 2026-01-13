import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";
import fs from "fs";
import path from "path";
import { error } from "console";

export async function POST(req) {
    const formData = await req.formData();
    const caseId = formData.get("caseId");
    const files = formData.getAll("files");

    console.log("formdata files", formData);
    console.log("files", files);
    if(!caseId){
        return NextResponse.json({error: "Missing caseid"}, {status: 400})
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/case");
    if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, {recursive: true});

    const savedPhotos = [];
    
    for(const file of files){
        if(!(file instanceof File)) continue

        if(file.size > 5 * 1024 * 1024){
            return NextResponse.json(
                { error: `File ${file.name} too large. Max 5MB allowed`},
                {status: 400}
            )
        }

        if(!file.type.startsWith("image/")){
            return NextResponse.json(
                {error: `File ${file.name} is not an image`},
                {status: 400}
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);

        const photo = await prisma.casephotos.create({
            data:{
                CaseID: caseId,
                url: `/uploads/case/${filename}`,
                size: file.size,
                mimeType: file.type
            }
        })

        savedPhotos.push(photo)
    }

    return NextResponse.json({ message: "success", photos: savedPhotos });
}