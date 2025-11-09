FactoryBot.define do
  factory :income do
    association :account
    association :user
    sequence(:title) { |n| "収入#{n}" }
    amount { 200000 }
    received_on { Date.today }

    after(:build) do |income|
      income.category ||= create(:category, :income, account: income.account)
    end
  end
end

