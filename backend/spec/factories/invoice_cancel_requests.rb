FactoryBot.define do
  factory :invoice_cancel_request do
    association :invoice
    association :requested_by, factory: :user
    reason { "修正のため" }
    status { :pending }
  end
end
