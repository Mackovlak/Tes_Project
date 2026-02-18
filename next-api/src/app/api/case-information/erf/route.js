import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";
import fs from "fs";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "application/octet-stream",
]);

export async function POST(request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("files"); // multiple file inputs with same name
        const userId = formData.getAll("user");
        const userName = formData.getAll("userName");
        
        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, message: "No files uploaded" },
                { status: 400 }
            );
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads", "erf");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const results = [];

        for (const file of files) {
            const originalName = file.name;
            const caseId = path.parse(originalName).name; 
            const ownerIdNumber = Number.parseInt(userId, 10); // And this one
            const noteText = `Success upload ERF file by "${userName}" for case "${caseId}"`;   // Your forget this shit IN YOUR PR
            if  (!(/^([Cc]-\d+|\d+)$/.test(caseId))){
                results.push({
                    file: originalName,
                    caseId,                
                    status: "failed",
                    code: "INVALID_CASEID",
                    message: `Invalid filename: ${originalName}. Must match a valid CaseID (C-[CaseID]).`,
                });
                continue;
            }

            

            if (file.type && !ALLOWED_MIME.has(file.type)) {
              results.push({
                file: originalName,
                caseId,
                status: "failed",
                code: "INVALID_MIME",
                message: `File type "${file.type}" is not allowed.`,
                details: { allowed: Array.from(ALLOWED_MIME) },
              });
              continue;
            }

            const caseExists = await prisma.caseinformation.findUnique({
                where: { CaseID: caseId },
                select: { ErfDoc: true },
            });
            
            if (!caseExists) {
                results.push({
                    file: originalName,
                    caseId,
                    status: "failed",
                    code: "CASE_NOT_FOUND",
                    message: `No case found with ID: ${caseId}`,
                });
                continue;
            }
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileSize = buffer.byteLength;

            if (fileSize > MAX_FILE_SIZE) {
                results.push({
                    file: originalName,
                    status: "failed",
                    code: "FILE_TOO_LARGE",
                    message: `File too large (${(fileSize / 1024 / 1024).toFixed(
                        2
                    )} MB). Max allowed is ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
                });
                continue;
            }

            const savePath = path.join(uploadDir, originalName);
            fs.writeFileSync(savePath, buffer);
            const relativePath = `/uploads/erf/${originalName}`;
            await prisma.caseinformation.update({
                where: { CaseID: caseId },
                data: {
                    ErfDoc: relativePath,
                },
            });

            // 6. update case note
            await prisma.casenotes.create({
                data: {
                    CaseID : caseId,
                    LogType: "Notice ERF Upload",
                    ActionType: "System Log",
                    Template: "",
                    VisibleExternally: true,
                    MinutesSpent: 0,
                    Note: noteText,
                    CreatedBy: ownerIdNumber,
                },
            })

            results.push({
                file: originalName,
                status: "success",
                code: "UPLOADED",
                message: `File uploaded and linked to case ${caseId}`,
                path: relativePath,
            });  
        }

    const failed = results.filter(r => r.status === "failed");
    const success = results.filter(r => r.status === "success");

    return NextResponse.json({
      success: failed.length === 0,
      uploaded: success.length,
      failed: failed.length,
      results,
    });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "File upload failed",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
