FactoryBot.define do
  factory :invoice do
    association :issuer_account, factory: :account
    association :payer_account, factory: :account
    title { "請求書" }
    description { "説明" }
    amount_minor { 10_000 }
    currency { "JPY" }
    status { :draft }
    issue_date { nil }
    due_date { Time.zone.today + 14.days }
    invoice_number { SecureRandom.hex(4) }
    issuer_contact { { name: "発行者", email: "issuer@example.com" } }
    payer_contact { { name: "支払者", email: "payer@example.com" } }
  end
end
