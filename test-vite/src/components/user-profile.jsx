import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ApiCustomer from "@/api";
import Swal from "sweetalert2";
import { FormLabel } from "./ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { usePalette, useColor } from 'color-thief-react';



export function UserProfile() {
    const {user} = useAuth();
    const [dominantColor, setDominantColor] = useState([0, 200, 255]); const imgRef = useRef(null);
    

    const [isDialogEditOpen, setIsDialogEditOpen] = useState(false);

    const [formData, setFormData] = useState({
        Username: '',
        Name: '',
        Email: '',
        Phone: "",
        NewPassword: "",
        ProfilePhoto: null,
        Signature: null,
        Role: user.role
    })
    const [preview, setPreview] = useState({
        ProfilePhoto: null,
        Signature: null,
    });

    useEffect(() => {
        const fetchUser = async () => {
            Swal.fire({
                title: "Memuat Data User...",
                text: "Mohon tunggu sebentar",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });
            try {

                const getResFromUser = await ApiCustomer.get(`/api/user/${user.id}`);

                if (getResFromUser.data.success) {
                    Swal.close()
                    const res = getResFromUser.data.data;
                    setFormData({
                        ...formData,
                        Username: res.Username,
                        Name: res.Name,
                        Email: res.Email,
                        Phone: res.Phone || "",
                        ProfilePhoto: res.ProfilePhoto,
                        Signature: res.Signature,
                    })
                    setPreview({
                        ProfilePhoto: res.ProfilePhoto ? `${import.meta.env.VITE_API_BASE_URL}${res.ProfilePhoto}` : null,
                        Signature: res.Signature ? `${res.Signature}` : null,
                    });
                }

            } catch (err) {
                Swal.close()
                console.error(err)
            }
        }

        if (user?.id) fetchUser();
    }, [user?.id])


    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (files) {
            const file = files[0];
            setFormData((prev) => ({
                ...prev,
                [name]: file,
            }));
            setPreview((prev) => ({
                ...prev,
                [name]: URL.createObjectURL(file),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleOpenSignaturePad = () => {
        const sigWindow = window.open("/signature-pad", "Signature Pad", "width=600,height=400");

        const handleMessage = (event) => {
            if (event.data.type === "signature") {
            const base64Signature = event.data.signature;
            setFormData((prev) => ({ ...prev, Signature: base64Signature }));
            setPreview((prev) => ({ ...prev, Signature: base64Signature }));
            toast.success("Signature captured successfully!", {
                description: "Signature saved to profile form",
                position: "top-center",
            });
            window.removeEventListener("message", handleMessage);
            }
        };

        window.addEventListener("message", handleMessage);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value) fd.append(key, value)
        })
        for (let pair of fd.entries()) {
            console.log(pair[0], pair[1]);
        }


        try {
            const res = await ApiCustomer.patch(`/api/user/${user.id}`, fd, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            if (res.data.data) {
                localStorage.setItem("token", res.data.token);
                setIsDialogEditOpen(false);

                toast("data berhasil diupdate");
            }

        } catch (error) {
            toast("Error", {
                description: error.response?.data?.message || error.message || "Something went wrong",
            });
        }

    }

    const { data: dominantHex } = useColor(preview.ProfilePhoto, 'hex', { crossOrigin: 'anonymous' });
    console.log("Data : ",dominantHex)
    
    return (
        <div className="  flex  justify-center  items-center  h-full ">
            <Card className="relative w-1/2  flex-shrink-0 overflow-hidden rounded-2xl shadow-md p-0 m-0">
                {/* Header with background */}
                
                {/* <CardHeader className="relative flex flex-col items-center justify-center bg-gradient-to-b from-cyan-300 to-cyan-100/80 h-32"> */}
                <CardHeader
                    className="relative flex flex-col items-center justify-center h-32 transition-all duration-700"
                    style={{
                        background: dominantHex
                        ? `linear-gradient(to bottom, ${dominantHex}, ${dominantHex}80)` // warna utama + versi transparan
                        : 'linear-gradient(to bottom, #67e8f9, #cffafe)', // fallback warna cyan
                    }}
                    >

                    {!preview.ProfilePhoto && (
                        <div className="absolute -bottom-12 left-1/2 flex h-30 w-30 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-gray-200 text-gray-400 shadow-lg">
                            <span className="text-3xl font-bold">?</span>
                        </div>
                    )}
                    {preview.ProfilePhoto && (
                        <img
                            src={preview.ProfilePhoto}
                            ref={imgRef}
                            // crossOrigin="anonymous"
                            alt="Profile Preview"
                            className="absolute -bottom-12 left-1/2 h-30 w-30 -translate-x-1/2 rounded-full border-4 border-white shadow-lg object-cover"
                        />
                    )}
                </CardHeader>

                {/* Card Content */}
                <CardContent className="flex flex-col items-center gap-4 bg-white pt-16 text-center">
                    <CardTitle className="text-lg font-semibold">{formData?.Username || "No Name"}</CardTitle>
                    <Separator className="w-12 bg-gray-300" />
                    <CardTitle className="text-base text-gray-600">{formData?.Name || "No Name"}</CardTitle>

                    <div className="flex w-full justify-evenly text-sm text-gray-500">
                        <span>{formData.Email || "#####@gmail.com"}</span>
                        <span>{formData?.Phone || "######"}</span>
                    </div> 
                </CardContent>

                {/* Footer */}
                <CardFooter className="flex flex-col items-center bg-white gap-3 pb-4">
                    {preview.Signature && (
                        <img
                            src={preview.Signature}
                            alt="Signature Preview"
                            className="h-12 object-contain border rounded-md"
                        />
                    )}
                    <Badge
                        variant="outline"
                        className={user.role == 'admin' ? 'bg-amber-200' : 'bg-gray-200'}
                    >
                        Role: {user.role}
                    </Badge>

            <Dialog open={isDialogEditOpen} onOpenChange={setIsDialogEditOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="absolute top-4 right-4" onClick={() => setIsDialogEditOpen(true)}>Edit Profile
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg p-10">
                    <DialogTitle></DialogTitle>
                    <DialogDescription></DialogDescription>
                    <form onSubmit={handleSubmit} className="relative space-y-6">
                        <Card className="p-6 shadow-md rounded-2xl ">
                            {/* Header */}
                            <CardHeader className="text-center space-y-1">
                                <CardTitle className="text-xl font-bold">User Profile</CardTitle>
                                <CardDescription className="text-gray-500">
                                    Update your profile information
                                </CardDescription>
                            </CardHeader>

                            {/* Content */}
                            <CardContent className="flex flex-col md:flex-row gap-8">
                                {/* Upload Section */}
                                <div className="flex flex-col gap-6 items-center md:items-start w-full md:w-1/3">
                                    <div className="flex flex-col items-center gap-3">
                                        <label className="text-sm font-medium text-gray-600">
                                            Profile Photo
                                        </label>
                                        <Input type="file" name="ProfilePhoto" onChange={handleChange} />
                                        {preview.ProfilePhoto && (
                                            <img
                                                src={preview.ProfilePhoto}
                                                alt="Profile Preview"
                                                className="h-24 w-24 rounded-full object-cover border shadow"
                                            />
                                        )}
                                    </div>

                                    <div className="flex flex-col items-center gap-3">
                                        <label className="text-sm font-medium text-gray-600">Signature</label>
                                        {/* <Input type="file" name="Signature" onChange={handleChange} /> */}
                                        {preview.Signature && (
                                            <img
                                                src={preview.Signature}
                                                alt="Signature Preview"
                                                className="h-16 object-contain border rounded-md shadow"
                                            />
                                        )}
                                        <Button type="button" onClick={handleOpenSignaturePad}>
                                            Write Signature
                                        </Button>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="w-full md:w-2/3 space-y-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-gray-600">Username</label>
                                        <Input name="Username" value={formData.Username} disabled />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-gray-600">Name</label>
                                        <Input
                                            name="Name"
                                            value={formData.Name}
                                            onChange={handleChange}
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-gray-600">Email</label>
                                        <Input
                                            name="Email"
                                            value={formData.Email}
                                            onChange={handleChange}
                                            placeholder="Email"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-gray-600">Phone</label>
                                        <Input
                                            name="Phone"
                                            value={formData.Phone}
                                            onChange={handleChange}
                                            placeholder="Phone Number"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-gray-600">New Password</label>
                                        <Input
                                            type="password"
                                            name="NewPassword"
                                            value={formData.NewPassword}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                </div>
                            </CardContent>

                            {/* Footer */}
                            <CardFooter className="flex justify-end pt-4">
                                <Button type="submit" className="px-6">
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </DialogContent>
            </Dialog>
                </CardFooter>
            </Card>


        </div>
    );
}
