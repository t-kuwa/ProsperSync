import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

const mergeClassNames = (...classNames: Array<string | false | undefined>) =>
  classNames.filter(Boolean).join(" ");

export const inputBaseClassName =
  "rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40";

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
      className="flex flex-col text-sm text-slate-300"
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
        "flex items-start gap-3 text-xs text-slate-400",
        containerClassName,
      )}
    >
      <input
        id={controlId}
        name={name}
        type="checkbox"
        className={mergeClassNames(
          "mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500",
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

type SocialButtonProps = {
  icon: ReactNode;
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const SocialButton = ({
  icon,
  label,
  className,
  type,
  ...props
}: SocialButtonProps) => (
  <button
    type={type ?? "button"}
    className={mergeClassNames(
      "flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900/70",
      className,
    )}
    {...props}
  >
    <span aria-hidden className="text-lg">
      {icon}
    </span>
    {label}
  </button>
);
