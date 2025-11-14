require "rails_helper"

RSpec.describe "Api::V1::Budgets", type: :request do
  let(:user) { create(:user) }
  let(:account) { create(:account, owner: user) }
  let!(:membership) { create(:membership, :owner, account:, user:) }
  let!(:category) { create(:category, :expense, account:) }
  let!(:budget) { create(:budget, account:, category:, amount: 40_000, period_year: 2025, period_month: 4) }

  before do
    sign_in user
  end

  describe "GET /api/v1/accounts/:account_id/budgets" do
    it "returns budgets with progress" do
      get api_v1_account_budgets_path(account)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to be_an(Array)
      expect(body.first).to include("amount" => 40_000)
      expect(body.first).to have_key("current_spent")
    end
  end

  describe "POST /api/v1/accounts/:account_id/budgets" do
    let(:params) do
      {
        budget: {
          category_id: category.id,
          amount: 60_000,
          period_type: "monthly",
          period_year: 2025,
          period_month: 5,
          name: "5月の食費",
        },
      }
    end

    it "creates a new budget" do
      expect do
        post api_v1_account_budgets_path(account), params: params
      end.to change(Budget, :count).by(1)

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["name"]).to eq("5月の食費")
      expect(body["percentage"]).to eq(0)
    end
  end

  describe "PATCH /api/v1/accounts/:account_id/budgets/:id" do
    it "updates an existing budget" do
      patch api_v1_account_budget_path(account, budget), params: {
        budget: { amount: 55_000, period_type: "monthly", period_year: 2025, period_month: 4 },
      }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["amount"]).to eq(55_000)
    end
  end

  describe "DELETE /api/v1/accounts/:account_id/budgets/:id" do
    it "removes the budget" do
      expect do
        delete api_v1_account_budget_path(account, budget)
      end.to change(Budget, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
