"use client";

import { useFormContext, Controller } from "react-hook-form";
import { IconPicker } from "./IconPicker";
import { DEFAULT_ICON_NAME, IconName } from "./iconConfig";

export const FormIconPicker = ({ name }: { name: string }) => {
  const { control } = useFormContext();

  return <Controller control={control} name={name} defaultValue={DEFAULT_ICON_NAME} render={({ field }) => <IconPicker value={field.value as IconName} onChange={field.onChange} />} />;
};
