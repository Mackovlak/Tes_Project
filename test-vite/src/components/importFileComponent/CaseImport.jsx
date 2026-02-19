import { useMemo, useState } from "react";
import * as XLSX from "xlsx"
import Swal from "sweetalert2";
import { Button } from "../ui/button";
import { toast } from "sonner";
import ApiCustomer from "@/api";
import { Input } from "../ui/input";
import { useAuth } from "@/context/auth-context";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatDateForInput, formatDateForMySQL } from "../../lib/utils";

export function CaseTemplateButton() {
  const handleDownload = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/import/caseinformation`;
  };

  return (
    <Button variant={"outline"} onClick={handleDownload}>
      Download Case Template
    </Button>
  );
}


export function CaseImport() {
    const { user } = useAuth();
    const [file, setFile] = useState(null)

    const [previewRows, setPreviewRows] = useState([]);
    const [previewStats, setPreviewStats] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(null);

    const [createMissing, setCreateMissing] = useState(true);

    const columns = useMemo(
        () => [
            { key: "index", label: "#" },
            //CASE SECTION
            { key: "receivedDate", label: "Received Date" },
            { key: "resource", label: "Resource" },
            { key: "serviceCenter", label: "Service Center" },
            { key: "createdBy", label: "CreatedBy" },
            { key: "caseType", label: "CaseType" },
            { key: "problemDescription", label: "Problem Description" },

            //ASSET SECTION
            { key: "serial", label: "Serial" },
            { key: "product", label: "Product" },
            { key: "asset", label: "Asset Match" },
            { key: "productName", label: "Product Name" },
            { key: "warrantyStatus", label: "Warranty Status" },

            //Contact Section
            { key: "contactName", label: "Contact Name (CSV)" },
            { key: "contactMobile", label: "Contact Mobile (CSV)" },
            { key: "contactWA", label: "Contact WA (CSV)" },
            { key: "contactEmail", label: "Contac Email (CSV)" },
            { key: "picName", label: "PIC Name (CSV)" },
            { key: "picEmail", label: "PIC Email (CSV)" },
            { key: "picPhone", label: "PIC Phone (CSV)" },
            { key: "contact", label: "Contact Match" },

            //contact bind matching
            { key: "contactMatchName", label: "Contact Match Name" },
            { key: "contactMatchPhone", label: "Contact Match Phone" },
            { key: "contactMatchEmail", label: "Contact Match Email" },

            //Company Section
            { key: "companyName", label: "Company Name (CSV)" },
            { key: "companyMobile", label: "Company Mobile (CSV)" },
            { key: "companyWA", label: "Company WA (CSV)" },
            { key: "companyEmail", label: "Company Email (CSV)" },
            { key: "company", label: "Company Match" },

            { key: "companyMatchName", label: "Company Match Name" },
            { key: "companyMatchPhone", label: "Company Match Phone" },
            { key: "companyMatchEmail", label: "Company Match Email" },

            { key: "plan", label: "Plan" },
            { key: "isdReferenceCase", label: "(ISD) Reference Case" },
            { key: "caseSubject", label: "Case Subject" },
            { key: "status", label: "Status" },
        ],
        []
    );

    const handleFileUpload = async (e) =>{
        const uploaded = e.target.files?.[0];
        setFile(uploaded || null);
        if (uploaded) await handlePreview(uploaded);
        else {
            setPreviewRows([]);
            setPreviewStats(null);
            setPreviewError(null);
        }
    }
        
    const handlePreview = async (uploadedFile = file) => {
			if (!uploadedFile) {
				toast.warning("Upload Excel first to preview.");
				return;
			}

			setPreviewLoading(true);
			setPreviewError(null);

			try {
				const formData = new FormData();
				formData.append("file", uploadedFile);
				formData.append("createMissing", String(createMissing));
        formData.append("IDUser", user.id)
        formData.append("resource", user.resource)

				const response = await ApiCustomer.post(
					"/api/import/caseinformation/preview",
					formData
				);
				const payload = response.data;
        console.log("PAYLOAF ",payload)
				if (!payload.success) {
					setPreviewError(payload.message || "Failed to preview file.");
					setPreviewRows([]);
					setPreviewStats(null);
					return;
				}

				setPreviewRows(payload.rows || []);
				setPreviewStats({
					total: payload.totalRows,
					ready: payload.readyRows,
					blocked: payload.blockedRows,
				});
			} catch (err) {
				console.error("Preview failed", err);
				setPreviewError("Failed to preview file.");
				setPreviewRows([]);
				setPreviewStats(null);
			} finally {
				setPreviewLoading(false);
			}
		};
    const warrantyMapping = {
      "02N" : "In Warranty", // Normal Warranty
      "01T" : "Out Warranty", // Trade (Out Of Warranty)
    };


    const handleImport = async () => {
        Swal.fire({
          title: 'Brewing coffee ☕',
          html: 'Because good code takes caffeine',
          allowOutsideClick: false,
          width: 600,
          padding: "3em",
          color: "#716add",
          background: "#fff url(/images/trees.png)",
          backdrop: `
            rgba(0,0,123,0.4)
            url("https://www.nyan.cat/cats/vday.gif")
            left top
            no-repeat
          `,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        if (!file){
            toast.warning("No File Uploaded.");
            Swal.close()
            return;
        }

       
        const formData = new FormData();
        formData.append("file",file);
				formData.append("createMissing", String(createMissing));
        formData.append("IDUser", user.id)
        formData.append("resource", user.resource)

        try{
            const response = await ApiCustomer.post("/api/import/caseinformation",formData);
            const result = response.data;
            Swal.close();
            if (result.success) toast.success(result.message);
            else toast.warning(result.message);

        }catch(err){
            toast.warning("Failed to import data")
            console.error(err)
        }
    }
    return (
        <div className="mt-2 flex flex-col items-start space-y-4 w-full">
      <div className="flex items-center space-x-3">
        <Button variant="outline" onClick={() => handlePreview()}>
          {previewLoading ? "Previewing..." : "Preview Import"}
        </Button>

        <Button variant="outline" onClick={handleImport}>
          Import Case Data
        </Button>

        <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={createMissing}
            onChange={(e) => setCreateMissing(e.target.checked)}
          />
          createMissing
        </label>
      </div>

      {previewError && <div className="text-sm text-red-500">{previewError}</div>}

      {previewStats && (
        <div className="text-xs text-muted-foreground space-x-4">
          <span>Total: {previewStats.total}</span>
          <span>Ready: {previewStats.ready}</span>
          <span>Blocked: {previewStats.blocked}</span>
        </div>
      )}

      {previewRows.length > 0 && (
        <div className="w-full overflow-auto rounded-md border border-dashed border-slate-300 dark:border-slate-600">
          <Table className="min-w-full border-collapse text-xs sm:text-sm">
            <TableHeader className="sticky z-10 top-0 bg-gray-100/95 dark:bg-slate-800/95">
              <TableRow className="text-slate-800 dark:text-slate-100">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className="p-3 text-xs font-semibold text-left border border-slate-200 dark:border-slate-700 whitespace-nowrap"
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {previewRows.map((row, i) => {
                const resource = row.resource || {}
                const userImported = row.user || {}
                const inputs = row.inputs || {};
                const matches = row.matches || {};
                const plan = row.plan || {};
                const blocked = row.blocked;
                const caseSubject = row.caseSubject || "";
                const ISDReferenceCase = row.ISDReferenceCase || "";

                const companyText = matches.company
                  ? `#${matches.company.Company} (${matches.company.matchBy})`
                  : "-";
                const contactText = matches.contact
                  ? `#${matches.contact.name} (${matches.contact.matchBy})`
                  : "-";
                const assetText = matches.asset
                  ? `#${matches.asset.SerialNumber ?? matches.product.ProductNumber} (${matches.asset.matchBy})`
                  : "-";

                return (
                  <TableRow
                    key={row.index}
                    className={`hover:bg-blue-50/70 dark:hover:bg-slate-700 ${
                      i % 2 === 0
                        ? "bg-white dark:bg-slate-900"
                        : "bg-gray-50 dark:bg-slate-800/80"
                    }`}
                  >
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {row.index - 1}
                    </TableCell>

                    {/* CASE SECTION */}
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {formatDateForInput(inputs.ReceivedDate) ?? "-"}
                    </TableCell>

                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {resource.ResourceId ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {resource.ServiceCenterName ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.CreatedBy ?? "-"}
                    </TableCell>

                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.CaseType ?? "-"}
                    </TableCell>

                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.ProblemDescription ?? "-"}
                    </TableCell>

                    {/* Asset Section */}
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.SerialNumber ?? "-"}
                    </TableCell>

                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.ProductNumber ?? "-"}
                    </TableCell>
                    
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {assetText}
                    </TableCell>

                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {matches.asset?.ProductName ? matches.asset?.ProductName : matches.product?.ProductName ?? "-"}
                    </TableCell>

                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {warrantyMapping[inputs.Warranty_Status] ?? "-"}
                    </TableCell>

                    {/* Contact Section */}
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.CustomerName ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.CustomerMobile ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.CustomerWA ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.CustomerEmail ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.PICName ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.PICEmail ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.PICPhone ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {contactText}
                    </TableCell>

                    {/* TODO FOR SLAMET (OR ALL WHO REDESIGN THIS) */}
                    {/* {matches.contact ? 1 : 0} */}
                    {/* THAT CODE IS FUNCTION FOR FILTERING WHEREVER THE CONTACT IS MATCHES DATABASE OR NOT */}
                    {/* IF YOU WANT, THAT FUNCTION IS USED FOR FILTERING SHOWING THE CREATED DATA IF NOT MATCHING THE DATABASE */}
                    {/* BUT RIGHT NOW, LEMME JUST - THIS THING */}
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {matches.contact?.name ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {matches.contact?.Phone ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {matches.contact?.Email ?? "-"}
                    </TableCell>


                    {/* Company Section */}
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.Company ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.CompanyPrimaryPhone ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.CompanyMobileNo ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {inputs.CompanyEmail ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {companyText}
                    </TableCell>

                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {matches.company?.Company ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {matches.company?.PrimaryPhone ?? "-"}
                    </TableCell>
                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {matches.company?.Email ?? "-"}
                    </TableCell>




                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-xs">
                          {Array.isArray(plan.actions) ? plan.actions.join(", ") : "-"}
                        </span>
                        {Array.isArray(plan.warnings) && plan.warnings.length > 0 && (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400">
                            ⚠ {plan.warnings.join(", ")}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {ISDReferenceCase ?? "-"}
                    </TableCell>

                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {caseSubject ?? "-"}
                    </TableCell>

                    <TableCell className="p-3 border border-slate-200 dark:border-slate-800">
                      {blocked ? (
                        <div className="text-red-500">
                          Blocked
                          {Array.isArray(row.reasons) && row.reasons.length > 0 && (
                            <div className="text-[11px] mt-1">
                              {row.reasons.slice(0, 2).join(" | ")}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">Ready</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
    );
}