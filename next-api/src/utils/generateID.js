import prisma from "../../prisma/client";

// Accept an optional Prisma client (e.g., transaction 'tx') to ensure
// ID generation sees writes within the same transaction/connection.
export async function generateID(prefix, modelName, idField, client = prisma, searchableId = idField,) {
  // Cari ID terakhir berdasarkan urutan DESC
  const prefixStr = String(prefix);

  const lastRecord = await client[modelName].findFirst({
    where: {
      [idField]: {
        startsWith: prefixStr,
      },
    },
    orderBy: {
      [searchableId]: "desc",
    },
    select: {
      [idField]: true,
      [searchableId]: true,
    },
  });

  let nextNumber = 1;

  if (lastRecord) {
    const lastNumber = parseInt(lastRecord[idField].replace(prefixStr, "").replace("-", ""), 10);
    nextNumber = lastNumber + 1;
    console.log("Record : ",lastRecord)
    console.log("GEN ID : ",lastNumber, nextNumber)
  }

  const paddedNumber = String(nextNumber).padStart(7, "0");
  const newID = `${prefixStr}${paddedNumber}`;
  // return console.log(newID, paddedNumber, prefixStr, prefix)

  console.log(`GeneratedID : ${newID}`);
  return newID;
}
