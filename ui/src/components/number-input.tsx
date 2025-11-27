import { forwardRef, useEffect, useState } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";

export interface NumberInputProps
  extends Omit<NumericFormatProps, "value" | "onValueChange"> {
  stepper?: number;
  thousandSeparator?: string;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  value?: number;
  suffix?: string;
  prefix?: string;
  onValueChange?: (value: number | undefined) => void;
  fixedDecimalScale?: boolean;
  decimalScale?: number;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      onValueChange,
      suffix,
      prefix,
      value: controlledValue,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useState<number | undefined>(
      controlledValue ?? defaultValue,
    );

    useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue);
      }
    }, [controlledValue]);

    const handleChange = (values: {
      value: string;
      floatValue: number | undefined;
    }): void => {
      const newValue =
        values.floatValue === undefined ? undefined : values.floatValue;
      setValue(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    const handleBlur = (): void => {
      if (value !== undefined) {
        if (value < min) {
          setValue(min);
        } else if (value > max) {
          setValue(max);
        }
      }
    };

    return (
      <div className="flex items-center">
        <NumericFormat
          value={value}
          onValueChange={handleChange}
          allowNegative={min < 0}
          valueIsNumericString
          onBlur={handleBlur}
          max={max}
          min={min}
          suffix={suffix}
          prefix={prefix}
          customInput={Input}
          placeholder={placeholder}
          className="relative [appearance:textfield] rounded-r-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          getInputRef={ref}
          {...props}
        />
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";
export default NumberInput;
