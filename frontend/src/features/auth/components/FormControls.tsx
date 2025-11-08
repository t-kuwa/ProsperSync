import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

const mergeClassNames = (...classNames: Array<string | false | undefined>) =>
  classNames.filter(Boolean).join(" ");

export const inputBaseClassName =
  "rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200/80";

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
      className="flex flex-col text-sm text-slate-600"
    >
      <span className="mb-2 font-semibold">{label}</span>
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
        "flex items-start gap-3 text-xs text-slate-500",
        containerClassName,
      )}
    >
      <input
        id={controlId}
        name={name}
        type="checkbox"
        className={mergeClassNames(
          "mt-1 h-4 w-4 rounded border-slate-300 bg-white text-indigo-500 focus:ring-indigo-400",
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
      "flex w-full items-center justify-center rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300",
      className,
    )}
    disabled={loading || disabled}
    aria-busy={loading || undefined}
    {...props}
  >
    {loading ? loadingLabel : idleLabel}
  </button>
);
