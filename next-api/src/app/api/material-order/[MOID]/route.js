import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";

export async function GET(request, { params }) {
  const { MOID: moid } = await params;

    if (!moid) {
        return NextResponse.json({
            success: false,
            message: "Invalid Material Order ID"
        }, { status: 400 });
    }
    try{
        const materialorder = await prisma.materialorder.findUnique({
            where: { MOID: moid },
            include: {
                workorder: {
                    include: {
                        serviceCatalog: {
                          include : {
                            warranty_services: true,
                          },
                        },
                        caseinformation: {
                            include:{
                                site_account : true,
                                contact_information : true
                            }
                        },
                        bookings: {
                            include: {
                                bookingDetails: true
                            }
                        }
                    }
                },
                owner: true,
                materialorderlineitems: true
            }
        });
    
        if (!materialorder) {
            return NextResponse.json({
                success: false,
                message: "Detail Data Material Order Not Found!",
                data: null
            }, { status: 404 });
        }
    
        return NextResponse.json({
            success: true,
            message: "Detail Data Material Order",
            data: materialorder
        }, { status: 200 });
    }catch(err){
        console.error("🔥 ERROR in GET API:", err);

  
    return NextResponse.json({
      success: false,
      message: "Failed to fetch data",
      error: err.message,
    }, { status: 500 });
  }
}


// ======================= PATCH =======================
export async function PATCH(request, { params }) {
  const { MOID: moid } = await params;

  if (!moid || typeof moid !== "string" || moid.length > 13) {
    return NextResponse.json({
      success: false,
      message: "Invalid Material Order ID",
    }, { status: 400 });
  }

  try {

    const body = await request.json();
    const moUpdates = body.moUpdates || {}; // prevent crash if undefined

    const {
      orderNumber: OrderNumber,
      orderType: OrderType,
      shippingPriority: ShippingPriority,
      ReadyForClosureDate: ReadyForClosureDate,
      DeliveryRequestedDate: DeliveryRequestedDate,
      CollectionRequestedDate: CollectionRequestedDate,
      promoCode: PromoCode,
      customerInducedDamage: CustomerInducedDamage,
      accidentalDamageProtection: AccidentalDamageProtection,
      defectiveMediaRetention: DefectiveMediaRetention,
      notificationNumber: NotificationNumber,
      SalesOrderNumber,
      parentMO: ParentMOID,
      isBCPOrder: IsBCPOrder,
      materialOrderType: MaterialOrderType,
      eotOrderNumber: EOTOrderNumber,
      ownerID: OwnerID,
      createdOn: CreatedOn,
      orderStatus: OrderStatus,
      RMANumber,
      AWB_InCode,
      AWB_OutCode,
      RMAStatus
    } = moUpdates;
    const ChangeOrderStatus = OrderStatus ?? body.OrderStatus

    // return console.log("MOUPDATES : ",OrderStatus,"\n")

    const existingMaterialOrder = await prisma.materialorder.findUnique({
      where: { MOID: moid },
    });

    if (!existingMaterialOrder) {
      return NextResponse.json({
        success: false,
        message: "Material Order not found!",
      }, { status: 404 });
    }
    console.log(body)
    console.log("MOBODY : ",moUpdates)

    const updatedMaterialOrder = await prisma.materialorder.update({
      where: { MOID: moid },
      data: {
        OrderNumber,
        OrderStatus: ChangeOrderStatus,
        OrderType,
        CreatedOn,
        SalesOrderNumber,
        RMANumber,
        ReadyForClosureDate,
        OwnerID,
        ShippingPriority,
        CustomerInducedDamage,
        AccidentalDamageProtection,
        DefectiveMediaRetention,
        DeliveryRequestedDate,
        CollectionRequestedDate,
        PromoCode,
        NotificationNumber,
        ParentMOID,
        IsBCPOrder,
        MaterialOrderType,
        EOTOrderNumber,
        AWB_InCode,
        AWB_OutCode,
        RMAStatus,
        // ResourceId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data Material Order Information Updated!",
      data: updatedMaterialOrder,
    });

  } catch (error) {
    console.error("🔥 ERROR in PATCH API:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update Material Order",
      error: error.message,
    }, { status: 500 });
  }
}
