# ==============================================
# 請求書のキャンセル申請
# ==============================================
class InvoiceCancelRequest < ApplicationRecord
  belongs_to :invoice
  belongs_to :requested_by, class_name: "User"
  belongs_to :resolved_by, class_name: "User", optional: true

  enum :status, { pending: 0, approved: 1, rejected: 2 }
end
