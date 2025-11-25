import type { ReactNode } from "react";
import type { ActiveTab } from "../types";
import AuthTabs from "./AuthTabs";
import { Card } from "../../../components/ui/Card";

export const AuthCard = ({
  activeTab,
  onTabChange,
  children,
}: {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  children: ReactNode;
}) => {
  return (
    <Card className="w-full p-8 md:p-10">
      <div className="w-full">
        {activeTab === "signup" && (
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-text-secondary mb-6">
            <span>Already have an account?</span>
            <button
              type="button"
              onClick={() => onTabChange("login")}
              className="font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Sign in
            </button>
          </div>
        )}

        {activeTab === "login" && (
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-text-secondary mb-6">
            <span>New here?</span>
            <button
              type="button"
              onClick={() => onTabChange("signup")}
              className="font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Create account
            </button>
          </div>
        )}

        <AuthTabs activeTab={activeTab} onChange={onTabChange} />

        <div className="mt-8">
          {/* Heading and subheading are handled in parent now, but keeping children structure */}
          {children}
        </div>
      </div>
    </Card>
  );
};

export default AuthCard;
