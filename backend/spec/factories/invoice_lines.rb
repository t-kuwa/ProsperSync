FactoryBot.define do
  factory :invoice_line do
    association :invoice
    description { "明細" }
    quantity { 1 }
    unit_price_minor { 5_000 }
    position { 1 }
  end
end
