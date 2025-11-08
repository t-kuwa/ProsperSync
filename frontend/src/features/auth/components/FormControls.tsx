import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

const mergeClassNames = (...classNames: Array<string | false | undefined>) =>
  classNames.filter(Boolean).join(" ");

export const inputBaseClassName =
  "rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

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
  const controlId = id ?? name;

  return (
    <label
      htmlFor={controlId}
      className="flex flex-col text-sm text-slate-700"
    >
      <span className="mb-2 font-medium">{label}</span>
      <input
        id={controlId}
        name={name}
        className={mergeClassNames(inputBaseClassName, className)}
        {...props}
      />
    </label>
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
        "flex items-center gap-3 text-xs text-slate-600",
        containerClassName,
      )}
    >
      <input
        id={controlId}
        name={name}
        type="checkbox"
        className={mergeClassNames(
          "h-4 w-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500",
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
  <button
    type={type ?? "submit"}
    className={mergeClassNames(
      "flex w-full items-center justify-center rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-500/50",
      className,
    )}
    disabled={loading || disabled}
    aria-busy={loading || undefined}
    {...props}
  >
    {loading ? loadingLabel : idleLabel}
  </button>
);
