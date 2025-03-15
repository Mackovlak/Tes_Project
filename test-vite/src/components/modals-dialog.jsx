import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useState } from "react"

import {
    Computer,
} from "lucide-react"
import {TableDemo} from "@/components/table-test"

export function DialogDemo() {
    const [value, setValue] = useState("");
    function handleChange(e) {
        setValue(e.target.value);
    }
  return (
    <Dialog >
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader >
          <DialogTitle className="flex gap-1"><Computer></Computer>Assets</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="">
              Select Assets
            </Label>
            <Input id="name" value={value} onChange={handleChange} className="col-span-3" />
          </div>
          <TableDemo></TableDemo>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
