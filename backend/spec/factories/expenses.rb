FactoryBot.define do
  factory :expense do
    association :account
    association :user
    sequence(:title) { |n| "支出#{n}" }
    amount { 1000 }
    spent_on { Date.today }

    after(:build) do |expense|
      expense.category ||= create(:category, :expense, account: expense.account)
    end
  end
end

