# ==============================================
# 請求書の明細行
# ==============================================
class InvoiceLine < ApplicationRecord
  belongs_to :invoice

  validates :description, presence: true
  validates :quantity, numericality: { only_integer: true, greater_than_or_equal_to: 1, message: "は1以上で入力してください" }
  validates :unit_price_minor, numericality: { only_integer: true, greater_than: 0, message: "は1以上で入力してください" }
end
