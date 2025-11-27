# ==============================================
# 請求書を管理するモデル
# ==============================================
class Invoice < ApplicationRecord
  belongs_to :issuer_account, class_name: "Account"
  belongs_to :payer_account, class_name: "Account"

  has_many :invoice_lines, dependent: :destroy
  has_many :invoice_cancel_requests, dependent: :destroy

  enum :status, { draft: 0, issued: 1, cancel_pending: 2, canceled: 3 }

  accepts_nested_attributes_for :invoice_lines

  validates :title, presence: true
  validates :amount_minor, numericality: { only_integer: true, greater_than: 0, message: "は1以上で入力してください" }
  validates :currency, presence: true
  validates :invoice_number, uniqueness: { scope: :issuer_account_id }, allow_nil: true
end
