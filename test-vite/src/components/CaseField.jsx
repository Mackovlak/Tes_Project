import React from "react";
import { Lock } from "lucide-react";
import { CardTitle } from "./ui/card";
import { twMerge } from "tailwind-merge";
import { Label } from "./ui/label";

const spanMap = {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
};

const CaseField = ({ label, children, lock = false, span = 1, className, childClass, star = false, hide, labelId, fieldId, indent = false, errors= [] }) => {
    if (hide) return null;
    
    // Determine which lock to use
    const IconComponent = lock === true ? Lock : lock || null;
    const modifiedChildren = React.Children.map(children, (child) => {
        if (React.isValidElement(child) && lock) {
            return React.cloneElement(child, { readOnly: true });
        }
        return child;
    });
    return (
        <>
            <Label className={twMerge(
                `font-normal flex  items-center gap-4 text-md ${className}`
            )}  id={labelId}>
                {IconComponent ? (
                    <IconComponent className="size-4 shrink-0" />
                ) : indent ? (
                   "" 
                ) : (
                    <div className="w-5" />
                ) }
                {label}
                {star ? <span className="text-red-400 dark:text-[#FF8A80]">*</span> : ""}
            </Label>
            <CardTitle className={twMerge(spanMap[span], childClass, "font-semibold items-center flex flex-col")} id={fieldId}>
                {modifiedChildren}
               {errors && errors.length > 0 ? (
                    <span className="text-[13px] font-medium text-red-500 mt-1">
                        {errors.map(err => err.message || err).join(", ")}
                    </span>
                ) : null}
            </CardTitle>
        </>
    );
};

export default CaseField;
