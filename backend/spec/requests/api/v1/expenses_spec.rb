require "rails_helper"

RSpec.describe "API::V1::Expenses", type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user) }
  let!(:membership) { create(:membership, :owner, account:, user:) }
  let(:other_user) { create(:user) }
  let!(:category) { create(:category, :expense, account:) }

  describe "GET /api/v1/accounts/:account_id/expenses" do
    let!(:recent_expense) do
      create(:expense, account:, user:, category:, spent_on: Date.new(2025, 2, 10), amount: 5000)
    end
    let!(:old_expense) do
      create(:expense, account:, user:, category:, spent_on: Date.new(2025, 1, 1), amount: 1000)
    end

    it "日付順の支出がシリアライズされて返ること" do
      get "/api/v1/accounts/#{account.id}/expenses", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(parsed_body.first).to include(
        "id" => recent_expense.id,
        "category" => include("id" => category.id, "name" => category.name),
        "user" => include("id" => user.id, "email" => user.email),
      )
    end

    it "monthパラメータで絞り込めること" do
      get "/api/v1/accounts/#{account.id}/expenses",
          params: { month: "2025-02" },
          headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(parsed_body.map { |item| item["id"] }).to eq([recent_expense.id])
    end

    it "month形式が不正な場合422を返すこと" do
      get "/api/v1/accounts/#{account.id}/expenses",
          params: { month: "invalid" },
          headers: auth_headers(user)

      expect(response).to have_http_status(:unprocessable_content)
      expect(parsed_body["errors"]).to include("monthパラメータはYYYY-MM形式で指定してください。")
    end

    it "非メンバーは拒否されること" do
      get "/api/v1/accounts/#{account.id}/expenses", headers: auth_headers(other_user)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/accounts/:account_id/expenses" do
    let(:payload) do
      {
        expense: {
          title: "クラウド利用料",
          amount: 12000,
          spent_on: "2025-02-15",
          memo: "2月分",
          category_id: category.id,
        },
      }
    end

    it "支出を作成してシリアライズされた結果を返すこと" do
      expect do
        post "/api/v1/accounts/#{account.id}/expenses", params: payload, headers: auth_headers(user), as: :json
      end.to change { account.expenses.reload.count }.by(1)

      expect(response).to have_http_status(:created)
      expect(parsed_body).to include("title" => "クラウド利用料", "user_id" => user.id, "category_id" => category.id)
    end

    it "カテゴリがアカウント外なら422を返すこと" do
      post "/api/v1/accounts/#{account.id}/expenses",
           params: { expense: payload[:expense].merge(category_id: 0) },
           headers: auth_headers(user),
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(parsed_body["errors"]).to include("指定されたカテゴリが見つかりません。")
    end
  end

  describe "PATCH /api/v1/accounts/:account_id/expenses/:id" do
    let!(:expense) { create(:expense, account:, user:, category:, title: "旧タイトル") }

    it "支出を更新できること" do
      patch "/api/v1/accounts/#{account.id}/expenses/#{expense.id}",
            params: { expense: { title: "新タイトル", amount: 8888 } },
            headers: auth_headers(user),
            as: :json

      expect(response).to have_http_status(:ok)
      expect(parsed_body).to include("title" => "新タイトル", "amount" => 8888)
    end
  end

  describe "DELETE /api/v1/accounts/:account_id/expenses/:id" do
    let!(:expense) { create(:expense, account:, user:, category:) }

    it "支出を削除できること" do
      expect do
        delete "/api/v1/accounts/#{account.id}/expenses/#{expense.id}", headers: auth_headers(user), as: :json
      end.to change { account.expenses.reload.count }.by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
