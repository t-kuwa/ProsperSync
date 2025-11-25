import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

const mergeClassNames = (...classNames: Array<string | false | undefined>) =>
  classNames.filter(Boolean).join(" ");

type FormFieldProps = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const FormField = ({
  label,
  id,
  className,
  name,
  ...props
}: FormFieldProps) => {
  return (
    <Input
      label={label}
      id={id ?? name}
      name={name}
      className={className}
      {...props}
    />
  );
};

type FormCheckboxProps = {
  label: ReactNode;
  containerClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const FormCheckbox = ({
  label,
  id,
  name,
  className,
  containerClassName,
  ...props
}: FormCheckboxProps) => {
  const controlId = id ?? name;

  return (
    <label
      htmlFor={controlId}
      className={mergeClassNames(
        "flex items-center gap-3 text-sm text-text-secondary cursor-pointer",
        containerClassName,
      )}
    >
      <input
        id={controlId}
        name={name}
        type="checkbox"
        className={mergeClassNames(
          "h-4 w-4 rounded border-border text-primary focus:ring-primary",
          className,
        )}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
};

type FormSubmitButtonProps = {
  loading: boolean;
  loadingLabel: string;
  idleLabel: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const FormSubmitButton = ({
  loading,
  loadingLabel,
  idleLabel,
  className,
  disabled,
  type,
  ...props
}: FormSubmitButtonProps) => (
  <Button
    type={type ?? "submit"}
    className={`w-full ${className || ""}`}
    disabled={loading || disabled}
    isLoading={loading}
    {...props}
  >
    {loading ? loadingLabel : idleLabel}
  </Button>
);
