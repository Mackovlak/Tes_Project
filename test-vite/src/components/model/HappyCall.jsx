import { DialogTitle } from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import { useServiceCaseStore } from "@/hooks/useServiceCaseStore";
import ClassicMonthSlider from "../ClassicMonthSlider";
import StarRatingSlider from "../StarRatingSlider";
import { Button } from "../ui/button";

export const HappyCall = ({
  open,
  onOpenChange
}) => {
  const [answerOne, setAnswerOne] = useState("");
  const [answerTwo, setAnswerTwo] = useState("");

  const assetInformation = useServiceCaseStore((s) => s.assetInformation);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"w-fit sm:max-w-2xl"}>
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <Card
          className={
            "flex-col col-span-2 dark:bg-radial-[at_30%_80%] dark:from-slate-600 dark:via-slate-800 dark:to-slate-700 dark:border-gray-700 dark:border-4 shadow-2xl"
          }
        >
          <CardHeader>
            <CardTitle className={"text-3xl text-center font-serif"}>
              Happy Call
            </CardTitle>
            <hr className="dark:border-gray-500" />
          </CardHeader>
          <CardContent
            className={"flex flex-col gap-4 overflow-auto max-h-100"}
          >
            <div className="grid gap-2">
              <div className="text-center text-2xl font-bold font-serif bg-gray-300">
                1
              </div>
              <h1 className="text-justify">
                apakah unit bapak/ibu yang di service yaitu{" "}
                {assetInformation?.product_information?.productname} dengan
                problem tidak bisa masuk windows karena percobaan masuk pin
                gagal setelah diperbaiki sudah kembali berfungsi normal?
              </h1>
              <RadioGroup
                value={answerOne}
                onValueChange={setAnswerOne}
                className={"flex justify-center"}
              >
                <label className="cursor-pointer">
                  <RadioGroupItem
                    value="yes"
                    id="yes"
                    className="peer sr-only"
                  />
                  <div
                    className={`rounded-xl ring-emerald-200 border  p-4 text-center transition-all
                                       hover:ring-2 ${answerOne === "yes" && "ring-1 shadow-3xl shadow-emerald-200"} `}
                  >
                    Yes
                  </div>
                </label>
                <label className="cursor-pointer">
                  <RadioGroupItem value="no" id="no" className="peer sr-only" />
                  <div
                    className={`rounded-xl ring-red-200 border p-4 text-center transition-all
                                       hover:ring-2 ${answerOne === "no" && "ring-1 shadow-3xl shadow-red-200"} `}
                  >
                    No
                  </div>
                </label>
              </RadioGroup>
            </div>
            {answerOne === "yes" ? (
              <>
                <div className="grid ">
                  <div className="text-center text-2xl font-bold font-serif bg-gray-300">
                    2
                  </div>
                  <h1 className="text-justify">
                    Bagaimana penilaian Bapak/Ibu terhadap pelayanan yang
                    diberikan HP pada saat itu? (Dari awal penerimaan,
                    konsultasi, proses perbaikan dan pengambilan) apakah
                    memuaskan?
                  </h1>
                  <RadioGroup
                    value={answerTwo}
                    onValueChange={setAnswerTwo}
                    className={"flex justify-center"}
                  >
                    <label className="cursor-pointer">
                      <RadioGroupItem
                        value="yes"
                        id="yes"
                        className="peer sr-only"
                      />
                      <div
                        className={`rounded-xl border p-4 text-center transition-all
                                       hover:border-primary ${answerTwo === "yes" && "border-primary shadow-2xl"} `}
                      >
                        Yes
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <RadioGroupItem
                        value="no"
                        id="no"
                        className="peer sr-only"
                      />
                      <div
                        className={`rounded-xl border p-4 text-center transition-all
                                       hover:border-primary ${answerTwo === "no" && "border-primary shadow-2xl"} `}
                      >
                        No
                      </div>
                    </label>
                  </RadioGroup>
                </div>
                {answerTwo === "yes" ? (
                  <div className="grid ">
                    <div className="text-center text-2xl font-bold font-serif bg-gray-300">
                      3
                    </div>
                    <h1 className="text-justify">
                      Terima kasih apabila Bapak/Ibu puas dengan layanan kami,
                      nanti Bapak/Ibu akan dikirimi undangan survey melalui
                      email, mohon Bapak/Ibu klik link yang diberikan (di email
                      tersebut) dan memilih score tertinggi ya pak/bu. (score
                      tertinggi itu adalah 9 atau 10 apabila Bapak/Ibu merasa
                      puas dengan layanan kami.)
                    </h1>
                  </div>
                ) : answerTwo === "no" ? (
                  <div className="grid ">
                    <div className="text-center text-2xl font-bold font-serif bg-gray-300">
                      4
                    </div>
                    <h1 className="text-justify">
                      Terima kasih atas feedbacknya, apakah Bapak/Ibu mau
                      memberikan saran mengenai apa yang dapat HP perbaiki /
                      improve agar kepuasan Bapak/Ibu bisa tercapai?
                    </h1>
                    <Textarea />
                  </div>
                ) : (
                  ""
                )}
              </>
            ) : answerOne === "no" ? (
              <div className="grid ">
                <div className="text-center text-2xl font-bold font-serif bg-gray-300">
                  5
                </div>
                <h1 className="text-justify">
                  Terima kasih atas feedbacknya, kalau boleh tahu kendala apa
                  yang Bapak/Ibu masih alami dengan unit tersebut?
                </h1>
                <Textarea />
              </div>
            ) : (
              ""
            )}
            <StarRatingSlider />
          </CardContent>
        </Card>
        <DialogFooter>
          <Button>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
