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
    it "進捗情報を含む予算を返すこと" do
      get api_v1_account_budgets_path(account)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to be_an(Array)
      expect(body.first).to include("amount" => 40_000)
      expect(body.first).to have_key("current_spent")
      expect(body.first).to include(
        "repeat_enabled" => false,
        "repeat_until_date" => nil,
        "parent_budget_id" => nil,
      )
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

    it "新しい予算を作成すること" do
      expect do
        post api_v1_account_budgets_path(account), params: params
      end.to change(Budget, :count).by(1)

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["name"]).to eq("5月の食費")
      expect(body["percentage"]).to eq(0)
      expect(body["repeat_enabled"]).to be(false)
      expect(body["repeat_until_date"]).to be_nil
    end

    context "繰り返し設定が有効な場合" do
      let(:params) do
        {
          budget: {
            category_id: category.id,
            amount: 60_000,
            period_type: "monthly",
            period_year: 2025,
            period_month: 5,
            name: "5月の食費",
            repeat_enabled: true,
            repeat_until_date: "2025-08-31",
          },
        }
      end

      it "繰り返し日付までの子予算を作成すること" do
        expect do
          post api_v1_account_budgets_path(account), params: params
        end.to change(Budget, :count).by(4) # parent + 3 children

        body = JSON.parse(response.body)
        parent = Budget.find(body["id"])
        expect(parent.repeat_enabled).to be(true)
        expect(parent.child_budgets.count).to eq(3)
        child_months = parent.child_budgets.order(:period_year, :period_month).pluck(:period_month)
        expect(child_months).to eq([6, 7, 8])
      end
    end
  end

  describe "PATCH /api/v1/accounts/:account_id/budgets/:id" do
    it "既存の予算を更新すること" do
      patch api_v1_account_budget_path(account, budget), params: {
        budget: { amount: 55_000, period_type: "monthly", period_year: 2025, period_month: 4 },
      }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["amount"]).to eq(55_000)
    end

    context "繰り返し予算の場合" do
      let!(:repeating_budget) do
        create(
          :budget,
          account:,
          category:,
          amount: 50_000,
          period_year: 2025,
          period_month: 1,
          repeat_enabled: true,
          repeat_until_date: Date.new(2025, 6, 30),
        )
      end

      before do
        Budgets::RepeatGenerator.call(parent_budget: repeating_budget)
      end

      it "新しい繰り返し範囲を超える子予算を削除し、不足しているものを再生成すること" do
        patch api_v1_account_budget_path(account, repeating_budget), params: {
          budget: {
            amount: 60_000,
            period_type: "monthly",
            period_year: 2025,
            period_month: 1,
            name: "年間定期",
            repeat_enabled: true,
            repeat_until_date: "2025-04-30",
          },
        }

        expect(response).to have_http_status(:ok)
        repeating_budget.reload
        months = repeating_budget.child_budgets.order(:period_month).pluck(:period_month)
        expect(months).to eq([2, 3, 4])
      end

      it "繰り返し範囲内の既存の子予算を変更せずに保持すること" do
        child = repeating_budget.child_budgets.order(:period_month).first
        child.update!(amount: 123_456)

        patch api_v1_account_budget_path(account, repeating_budget), params: {
          budget: {
            amount: 55_000,
            period_type: "monthly",
            period_year: 2025,
            period_month: 1,
            repeat_enabled: true,
            repeat_until_date: "2025-06-30",
          },
        }

        expect(response).to have_http_status(:ok)
        expect(child.reload.amount).to eq(123_456)
      end
    end
  end

  describe "DELETE /api/v1/accounts/:account_id/budgets/:id" do
    it "予算を削除すること" do
      expect do
        delete api_v1_account_budget_path(account, budget)
      end.to change(Budget, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
