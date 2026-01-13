import { driver } from 'driver.js';
import { Button } from './ui/button';
import { OctagonAlert } from 'lucide-react';
import { useLocation } from 'react-router';
import { useAuth } from '../context/auth-context';
import "driver.js/dist/driver.css";
import { description } from './sc-chart';

export const ButtonTour = () => {
    const location = useLocation()
    let caseId = null;
    console.log("location.pathname", location.pathname);
    if (location.pathname.startsWith("/app/case")) {
        // take the case id
         caseId = location.pathname.split("/").pop();
        console.log("caseId", caseId);
    }
    const {user, loading } = useAuth()
      if (loading || !user) {
    return null; 
  }
    const guideDesc = (title, items) => `<div style="font-weight:600;margin-bottom:6px">${title}: </div>
    <div style="line-height:1.5"> ${items.map(item => `• ${item}`).join('<br>')} </div>`;
    const TextList = ({ list }) => {
    return list.map((item, index) => `<div>${index + 1}. ${item}</div>`).join("");
    };

    const caseButtonDescByRole = {
      fd: [
        "Save: menyimpan perubahan pada case.",
        "Save & Close: menyimpan perubahan dan kembali ke laman sebelumnya.",
        "Close Case: menutup case yang sedang dibuka.",
        "Cancel Case: membatalkan case yang sedang dibuka.",
        "Refresh: memuat ulang data case.",
        "SRF: membuka PDF SRF untuk case yang sedang dibuka.",
        "ERF: membuka PDF ERF untuk case yang sedang dibuka.",
        "Signature Customer: membuka form tanda tangan customer untuk case yang sedang dibuka.",
        "Quotation Invoice: Membuka form PDF Quotation Invoice untuk case yang sedang dibuka.",
        "DP: membuka form PDF DP untuk case yang sedang dibuka.",
        "Invoice: membuka form PDF Invoice untuk case yang sedang dibuka.",
        "Quick Log Note: Membuka menu log note untuk pencatatan didalam case yang sedang dibuka.",
      ],
      ps: [
        "Save: menyimpan perubahan pada case.",
        "Save & Close: menyimpan perubahan dan kembali ke laman sebelumnya.",
        "Refresh: memuat ulang data case.",
        "Quick Log Note: Membuka menu log note untuk pencatatan didalam case yang sedang dibuka.",
      ],
      ce: [
        "Save: menyimpan perubahan pada case.",
        "Save & Close: menyimpan perubahan dan kembali ke laman sebelumnya.",
        "Refresh: Memuat ulang data case",
        "SRF: membuka PDF SRF untuk case yang sedang dibuka.",
        "Service Order: ",
        "Quick Log Note: "
      ],
      cm: [
        "Save: ",
        "Save & Close: ",
        "Refresh: ",
        "Quotation: ",
        "Quotation Invoice: ",
        "DP: ",
        "Invoice: ",
        "Quick Log Note: "
      ],
      apv: [
        "Save: ",
        "Refresh: ",
        "Approve: ",
      ]
    }
    const getCaseButtonDesc = (role) => {
      return caseButtonDescByRole[role] || [
        "Gunakan tombol yang tersedia untuk melakukan aksi pada case.",
      ];
    };

    const StepByPage = {
      "/app": [
        {
          element: "#sidebar",
          roles: ["fd", "ps", "admin", "apo", "ce", "lg", "celead", "cm"],
          popover: {
            title: "Sidebar",
            description: {
              fd: `<div style="font-weight:600;margin-bottom:6px">Fungsi Sidebar: </div>
                    ${TextList({
                      list: [
                        "Home: Halaman utama untuk melihat ringaksan dan navigasi aplikasi.",
                        "Your Cases: Menampilkan daftar kasus yang sedang ditangani oleh anda.",
                        "ERF Case: .",
                        "My Work: Berisi tugas atau pekerjaan yang pelu anda kerjakan atau tindak lanjuti.",
                        "View Case: Digunakan untuk mencari & melihat detail kasus yang sudah ada.",
                        "Master Fd: Digunakan untuk Mengelolah data uatam seperti Company, Assets, dan Contact yang akan dipakai saat membuat atau memproses Case.",
                        "Profil User : Menampilkan informasi akun yang sedang login dan digunakan untuk mengakses pengaturan akun atau logout.",
                      ],
                    })}`,
              ps: `<div style="font-weight:600;margin-bottom:6px">Fungsi Sidebar: </div>
                    ${TextList({
                      list: [
                        "Home: Halaman utama untuk melihat ringaksan dan navigasi aplikasi.",
                        "Your Cases: Menampilkan daftar kasus yang sedang ditangani oleh anda.",
                        "View Case: Digunakan untuk mencari & melihat detail kasus yang sudah ada.",
                        "Profil User : Menampilkan informasi akun yang sedang login dan digunakan untuk mengakses pengaturan akun atau logout.",
                      ],
                    })}`,
              lg: `<div style="font-weight:600;margin-bottom:6px">Fungsi Sidebar: </div>
                    ${TextList({
                      list: [
                        "Home: Halaman utama untuk melihat ringaksan dan navigasi aplikasi.",
                        "Your Cases: Menampilkan daftar kasus yang sedang ditangani oleh anda.",
                        "RMA: Digunakan untuk update RMA melalui upload data SO/RMA menggunakan template.",
                        "Profil User : Menampilkan informasi akun yang sedang login dan digunakan untuk mengakses pengaturan akun atau logout.",
                      ],
                    })}`,
            }[
              {
                ps: "ps",
                ce: "ps",
                lg: "lg",
                apo: "ps",
                celead: "ps",
                cm: "ps",
                admin: "fd",
                fd: "fd",
              }[user.role]
            ],
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#icsidebar",
          popover: {
            title: "Sidebar Trigger",
            description:
              "Gunakan tombol ini untuk membuka atau menutup sidebar.",
            side: "right",
            align: "center",
          },
        },
        {
          element: "#breadcrumbs",
          popover: {
            title: "Breadcrumbs",
            description: "Menunjukan posisi halaman anda saat ini",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#global-search",
          popover: {
            title: "Global Search",
            description:
              "Fitur pencarian cepat untuk menemukan data atau kasus dengan cepat,",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#three-button",
          popover: {
            title: "Three Button",
            description:
              "Gunakan Tombol di bagian ini untuk melihat guide, mengatur tampilan, notifikasi.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#dashboard",
          roles: ["fd", "celead", "ce", "apo", "lg", "cm"],
          popover: {
            title: "Dashboard",
            description:
              "Ini adalah halaman utama untuk memantau aktivitas dan status kasus Anda hari ini.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#storage-list",
          roles: ["ps"],
          popover: {
            title: "Storage List",
            description:
              "Pilih storage di sini untuk melihat detail data yang tersimpan.",
            side: "top",
          },
        },
        {
          element: "#storage-card",
          roles: ["ps"],
          popover: {
            title: "Storage Info",
            description:
              "Disini Anda dapat melihat Daftar Perangkat yang terdaftar di akun Anda lengkap dengan Serial number, model perangkat, dan status garansi.",
            side: "top",
          },
        },
        {
          element: "#profile",
          roles: ["fd", "celead", "ce", "apo", "lg", "cm"],
          popover: {
            title: "Profil Users",
            description:
              "Menampilkan informasi profil pengguna yang sedang login.",
          },
        },
        {
          element: "#cases-overview",
          roles: ["fd", "celead", "ce"],
          popover: {
            title: "Ringkasan Kasus",
            description:
              "Menampilkan jumlah kasus berdasarkan statusnya seperti Open, In Progress, dan Closed.",
            side: "right",
          },
        },
        {
          element: "#notifications",
          roles: ["fd", "celead", "ce", "apo", "lg", "cm"],
          popover: {
            title: "Notifikasi",
            description:
              "Menampilkan pemberitahuan terbaru terkait aktivitas kasus Anda.",
            side: "left",
          },
        },
        {
          element: "#recent-case",
          roles: ["fd", "celead", "ce", "apo"],
          popover: {
            title: "Kasus Terbaru",
            description:
              "Daftar kasus terbaru yang masuk dan perlu segera ditindak lanjuti.\n\n" +
              TextList({
                list: [
                  "Lihat Id dan judul case.",
                  "Check prioritas dan status.",
                  "klik case untuk melihat detail",
                ],
              }),
            side: "top",
          },
        },
        {
          element: "#sparepart",
          roles: ["lg"],
          popover: {
            title: "Sparepart",
            description:
              "Daftar permintaan sparepart yang perlu Anda setujui." +
              TextList({
                list: [
                  "Lihat nomor Mo, Status, dan detail sparepart.",
                  "Gunakan filter status untuk menyaring data.",
                  "Export sparepart untuk melihat detail.",
                  "Klik sparepart untuk melihat detail.",
                ],
              }),
            side: "top",
          },
        },
        {
          element: "#quotation",
          roles: ["cm"],
          popover: {
            title: "Quotation",
            description:
              "Daftar quotation yang sedang diproses." +
              TextList({
                list: [
                  "Lihat nomor Quotation, Status, dan detail quotation.",
                  "Perlihatkan prioritas dan status quotation.",
                  "Klik Quotation untuk melihat detail lengkap.",
                ],
              }),
            side: "top",
          },
        },
      ],
      "/app/searchcaseproto2": [
        {
          element: "#quickSearch",
          popover: {
            title: "Menu Search Serial Number & Customer",
            description: TextList({
              list: [
                "Masukkan data Serial Number atau Customer",
                "Jika data tersebut tidak ada maka checklist Asset Baru dan Customer Baru",
              ],
            }),
          },
        },
        {
          element: "#case",
          popover: {
            title: "Menu Case",
            description: TextList({
              list: [
                "Bintang merah, menandakan field wajib di isi",
                "Pengurutan Input: Case Subject / Problem Desc / Case Note",
              ],
            }),
          },
        },
        {
          element: "#customer",
          popover: {
            title: "Menu Customer, Pic & Company",
            description: TextList({
              list: [
                "Bintang merah, menandakan field wajib di isi",
                "Fungsi Checkbox, Apabila termasuk  PIC & Company",
              ],
            }),
          },
        },
        {
          element: "#product",
          popover: {
            title: "Menu Product",
            description: TextList({
              list: [
                "Bintang merah, menandakan field wajib di isi",
                "Search Product, untuk check ketersediaan product",
                "Jika Product tidak tersedia, maka add dengan checklist product baru",
                "Button Check warranty: untuk check product warranty",
                "Pengurutan Input: Product Tower / Product Group / Product Type / Product Line / Product Number / Product Name",
              ],
            }),
          },
        },
        {
          element: "#warranty",
          popover: {
            title: "Menu Warranty",
            description: TextList({
              list: [
                "Pilihlah opsi warranty status: sesuai dengan status unit tersebut",
                "EOW Date: tanggal unit warranty",
                "Apabila ingin mengajukan garansi kembali, maka: checklist need warranty approval ketika warranty status 01 Trade (OOW)",
              ],
            }),
          },
        },
        {
          element: "#accessories",
          popover: {
            title: "Menu Accessories (Opsional)",
            description: TextList({
              list: [
                "Pilihlah Opsi Accesories, apabila unit yang diberikan terdapat accessories",
                "Note: untuk mendeskripsikan kondisi accessories tersebut",
                "CT/SN: Kode number accessories tersebut",
              ],
            }),
          },
        },
        {
          element: "#photos",
          popover: {
            title: "Menu Photo (Opsional)",
            description: "Upload unit jika diperlukan",
          },
        },
      ],
      "/app/ErfCase": {
        main: [
          {
            element: "#erf-main-upload",
            popover: {
              title: "Upload ERF Files",
              description:
                "Gunakan bagian ini untuk mengunggah beberapa file ERF sekaligus.",
              side: "top",
            },
          },
        ],
        pending: [
          {
            element: "#erf-pending-table",
            popover: {
              title: "Closed Cases Table",
              description:
                "Tabel ini menampilkan daftar kasus yang telah ditutup.",
              side: "top",
            },
          },
        ],
      },
      "/app/flowcase": [
        {
          element: "#your-case",
          popover: {
            title: "Menu Your Case",
            description:
              "Halaman ini menampilkan daftar kasus yang ditugaskan kepada Anda dan perlu dipantau atau ditindaklanjuti.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#case-toggle",
          roles: ["fd", "admin"],
          popover: {
            title: "Filter Case",
            description: TextList({
              list: [
                "Show Finished Case : Menampilkan Case yang telah selesai.",
                "Show Closed Case : Menampilkan Case yang telah ditutup.",
              ],
            }),
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#case-card",
          popover: {
            title: "Informasi Case",
            description:
              TextList({
                list: [
                  "Case Id dan nama produk.",
                  "Informasi customer atau perusahaan.",
                  "Tanggal pembuatan dan update terakhir.",
                  "Status dan badge case.",
                ],
              }) + "Klik case untuk melihat detail.",
            side: "top",
          },
        },
        {
          element: "#case-badge",
          popover: {
            title: "Status & Case Badge",
            description:
              "Case badge digunakan untuk menandai kondisi, status case, dan informasi penting dari setiap case.\n" +
              "Jenis badge yang dapat ditampilkan dapat berbeda tergantung case dan peran user",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#case-search",
          popover: {
            title: "Search Sidebar",
            description:
              "Gunakan fitur Search untuk mencari dan menyaring case berdasarkan informasi utama.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#case-time",
          popover: {
            title: "Data Time",
            description:
              "Menampilkan informasi waktu terkait data case yang sedang ditampilkan.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#case-pagination",
          popover: {
            title: "Pagination",
            description:
              "Gunakan navigasi ini untuk berpindah antar halaman daftar case.",
            side: "top",
            align: "center",
          },
        },
      ],
      "/app/case": {
        case_info: [
          {
            element: "#case-buttons",
            popover: {
              title: "Case Action Buttons",
              description: guideDesc("Gunakan Tombol ini untuk melakukan aksi pada case yang dipilih",
                getCaseButtonDesc(user.role)
              ),
              side: "bottom",
              align: "center",
            },
          },
        {
          element: "#case-subject",
          roles: ["fd", "admin"],
          popover: {
            title: "Field Case Subject",
            description: "Ini Case Subject",
          },
        },
        {
          element: "#case-status",
          roles: ["fd", "admin"],
          popover: {
            title: "Field Case Status",
            description: "Ini Case Status",
          },
        },
        {
          element: "#case-type",
          roles: ["fd", "admin"],
          popover: { title: "Field Case Type", description: "Ini Case Type" },
        },
        {
          element: "#problem-desc",
          roles: ["fd", "admin"],
          popover: {
            title: "Field Problem Desc",
            description: "Ini Problem Desc",
          },
        },
        {
          element: "#case-priority",
          roles: ["fd", "admin"],
          popover: {
            title: "Field Case Priority",
            description: "Ini Case Priority",
          },
        },
        {
          element: "#customer-issue",
          roles: ["fd", "admin"],
          popover: {
            title: "Field Customer Issue",
            description: "Ini Customer Issue",
          },
        },
        {
          element: "#log-type",
          roles: ["fd", "admin"],
          popover: { title: "Field Log Type", description: "Ini Log Type" },
        },
        {
          element: "#action-type",
          roles: ["fd", "admin"],
          popover: {
            title: "Field Action Type",
            description: "Ini Action Type",
          },
        },
        {
          element: "#notes",
          roles: ["fd", "admin"],
          popover: { title: "Field Note", description: "Ini Note" },
        },
        ],
        ci_asset: [
          {
            element: "#asset-search",
            roles: ["fd", "admin"], 
            popover: { title: "CI Asset", description: "Ini adalah tab CI Asset",
            side: "top" },
          },
        ],
        action_log: [
          {
            element: "#action-log-table",
            roles: ["fd", "admin"], 
            popover: { title: "Action Log Table", description: "Ini adalah tab Action Log",
            side: "top" },
          },
        ],
        doc_photo: [
          {
            element: "#doc-photo-upload",
            roles: ["fd", "admin"], 
            popover: { title: "Document & Photo Upload", description: "Ini adalah tab Document & Photo",
            side: "top" },
          },
        ],
        quotation: [
          {
            element: "#quotation-table",
            popover: { title: "Quotation Table", description: "Ini adalah tab Quotation",
            side: "top" },
          },
        ],
      },
      "/app/viewcase": [
        {
          element: "#view-all-case",
          popover: {
            title: "View All Case",
            description: guideDesc("Halaman ini digunakan untuk", [
              "Melihat seluruh data case Anda.",
              "Mencari dan memfilter case.",
              "Mengakses detail case.",
            ]),
          },
        },
        {
          element: "#search-case",
          popover: {
            title: "Search Case",
            description: guideDesc("Gunakan Kolom ini untuk", [
              "Mencari Case ID.",
              "Mencari Subject Case.",
              "Mencari Serial Number.",
            ]),
          },
        },
        {
          element: "#filter-case",
          popover: {
            title: "Filter Case",
            description: guideDesc("Gunakan Fitur Filter case berdasarakan", [
              "HW / Product.",
              "Creator / Owner.",
              "WorkGroup & Case Type.",
              "Warranty Type & Status.",
            ]),
          },
        },
        {
          element: "#case-status-toggle",
          popover: {
            title: "Status Case",
            description: guideDesc(
              "Gunakan Toggle ini untuk menampilkan case berdasarkan statusnya",
              ["All", "Open", "In Progress", "Closed"]
            ),
          },
        },
        {
          element: "#case-actionbuttons",
          roles: ["fd", "admin"],
          popover: {
            title: "Action Buttons",
            description: guideDesc(
              "Gunakan Tombol ini untuk melakukan aksi pada case yang dipilih",
              [
                "Reset Filter: Menghapus semua filter.",
                "Export to Excel: Unduh data case ke format Excel.",
              ]
            ),
          },
        },
        {
          element: "#case-reset-filters",
          roles: ["ps", "celead", "ce", "apo", "cm", "lg"],
          popover: {
            title: "Reset Table",
            description: "Gunakan Tombol ini untuk menghapus semua filter.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#case-table",
          popover: {
            title: "Case Table",
            description: guideDesc(
              "Tabel ini menampilkan daftar case dengan informasi penting seperti",
              [
                "Case ID & Subject.",
                "Customer & Product.",
                "Priority & Status.",
                "Created Date & Owner.",
              ],
              "Klik Case ID untuk melihat detail case."
            ),
          },
        },
        {
          element: "#case-pagination",
          popover: {
            title: "Pagination",
            description:
              "Gunakan navigasi ini untuk berpindah antar halaman daftar case atau mengatur jumlah per halaman.",
            side: "top",
            align: "center",
          },
        },
      ],
      "/app/uploadRMA": [
        {element: "#rma-guide", popover: { title: "RMA Guide", 
            description: guideDesc('Untuk Mendapatkan pengalaman tutorial yang optimal, mohon perhatikan hal berikut',
            ['Silahkan pilih dan lengkapi field yang tersedia terlebih dahulu.','Tutorial akan menyesuikan dengan field yang anda pilih.','Pastikan pilihan sudah benar agar panduan yang ditampilkan sesuai.']
            ), side: 'top', align: 'center'
         }},
        {
          element: "#rma-page",
          roles: ["lg"],
          popover: {
            title: "Upload RMA Files",
            description: guideDesc("Halaman ini digunakan untuk", [
              "Memperbarui status RMA secara massal melalui unggahan file.",
              "Mengunggah data RMA melalui file Excel.",
              "Memastikan proses RMA tercatat dengan benar.",
            ]),
            side: "top",
          },
        },
        {
          element: "#rma-company",
          roles: ["lg"],
          popover: {
            title: "Company",
            description: guideDesc("Gunakan Field ini untuk", [
              "Memilih perusahaan atau unit bebas.",
              "Menyesuaikan data RMA dengan company terkait.",
            ]),
            side: "top",
          },
          onHighlightStarted: () => {
            document
              .querySelector("#rma-company-label")
              ?.classList.add("driver-active");
          },
          onDeselected: () => {
            document
              .querySelector("#rma-company-label")
              ?.classList.remove("driver-active");
          },
        },
        {
          element: "#rma-date",
          roles: ["lg"],
          popover: {
            title: "RMA Date",
            description: guideDesc("Gunakan Field ini untuk", [
              "Menentukan tanggal proses RMA.",
              "Mencatat waktu update status RMA.",
            ]),
            side: "top",
          },
          onHighlightStarted: () => {
            document
              .querySelector("#rma-date-label")
              ?.classList.add("driver-active");
          },
          onDeselected: () => {
            document
              .querySelector("#rma-date-label")
              ?.classList.remove("driver-active");
          },
        },
        {
          element: "#rma-status",
          roles: ["lg"],
          popover: {
            title: "RMA Status",
            description: guideDesc("Gunakan Field ini untuk", [
              "Memilih status RMA yang akan perbarui.",
              "Menyesuaikan status dengan format file yang diunggah.",
            ]),
            side: "top",
          },
          onHighlightStarted: () => {
            document
              .querySelector("#rma-status-label")
              ?.classList.add("driver-active");
          },
          onDeselected: () => {
            document
              .querySelector("#rma-status-label")
              ?.classList.remove("driver-active");
          },
        },
        {
          element: "dw-so-template",
          roles: ["lg"],
          popover: {
            title: "Download SO Template",
            description: guideDesc("Gunakan Tombol ini untuk", [
              "Mengunduh template file SO sesuai status RMA yang dipilih.",
              "Memastikan format file sesuai untuk proses upload.",
            ]),
            side: "top",
          },
        },
        {
          element: "#upload-rma-file",
          roles: ["lg"],
          popover: {
            title: "Upload File SO / RMA",
            description: guideDesc("Gunakan Fitur ini untuk", [
              "Mengunggah file Excel berisi data SO/RMA.",
              "Memperbarui status RMA secara massal berdasarkan file yang diunggah.",
            ]),
            side: "top",
          },
        },
        {
          element: "#preview-import",
          roles: ["lg"],
          popover: {
            title: "Preview Data",
            description: guideDesc("Gunakan Tombol ini untuk", [
              "Meninjau data sebelum diproses.",
              "Memastikan tidak ada kesalahan data.",
            ]),
          },
          side: "top",
        },
        {
          element: "#import-asset-data",
          roles: ["lg"],
          popover: {
            title: "Import Asset Data",
            description: guideDesc("Gunakan Tombol ini untuk", [
              "Memproses data RMA yang telah diunggah.",
              "Memperbarui status RMA ke dalam system.",
            ]),
          },
          side: "top",
        },
        {
          element: "#rma-info",
          roles: ["lg"],
          popover: {
            title: "Informasi Penting",
            description: guideDesc(
              "Perhatikan informasi berikut saat mengunggah file RMA",
              [
                "Setiap status RMA memiliki format kolom yang berbeda.",
                "Pastikan data SO No dan RMA No diisi dengan benar.",
                "Kesalahan format dapat menyebabkan proses gagal.",
              ]
            ),
          },
          side: "top",
        },
      ],
      "/app/work": [
        {
          element: "#uknown",
          popover: {
            title: "lol Photo (Opsional)",
            description: "Upload unit jika diperlukan",
          },
        },
      ],
      "/app/material-order": [
        {
          element: "#uknown",
          popover: {
            title: "lol Photo (Opsional)",
            description: "Upload unit jika diperlukan",
          },
        },
      ],
      "/app/mo_detail": [
        {
          element: "#uknown",
          popover: {
            title: "lol Photo (Opsional)",
            description: "Upload unit jika diperlukan",
          },
        },
      ],
    };

    const hash = location.hash.replace('#','');
    let pageStep = StepByPage[location.pathname] || [];

    if (location.pathname.startsWith("/app/case")) {
        const activeTab = hash ||"case_info";
        // const casepath = "/app/case/" + caseId;
        pageStep = StepByPage["/app/case"]?.[activeTab] ?? [];
    }
    if (location.pathname.startsWith("/app/work")) {
        pageStep = StepByPage["/app/work"]
    }
    if (location.pathname.startsWith("/app/material-order")) {
        pageStep = StepByPage["/app/material-order"]
    }
    if (location.pathname.startsWith("/app/mo_detail")) {
        pageStep = StepByPage["/app/mo_detail"]
    }
    if (location.pathname.startsWith("/app/ErfCase")) {
        pageStep = StepByPage["/app/ErfCase"]?.[hash] || [];
    }

      const filterStepRoll = Array.isArray(pageStep) 
      ? pageStep.filter(step => {
        if(!step.roles) {
            return true;
        }
        return step.roles.includes(user.role)
      })
      : [];

    const driverObj = driver({
        onPopoverRender: (popover, { config, state }) => {
            const firstButton = document.createElement("button");
            firstButton.innerText = "Go to First";
            popover.footerButtons.appendChild(firstButton);

            firstButton.addEventListener("click", () => {
            driverObj.drive(0);
            });
        }, 
        showProgress: true,
        smoothScroll: true,
        steps: filterStepRoll
        
    });
    
    return (
        <>
            <Button title={"Guidline"} variant={"outline"} className={"cursor-pointer dark:border-b-slate-500 dark:bg-gradient-to-b dark:from-slate-600 dark:via-slate-800 dark:to-slate-700"} onClick={() => driverObj.drive()}>
                <OctagonAlert/>
            </Button>
        </>
    )
}

