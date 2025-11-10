require "rails_helper"

RSpec.describe "API::V1::Categories", type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user) }
  let!(:membership) { create(:membership, :owner, account:, user:) }
  let(:other_user) { create(:user) }

  describe "GET /api/v1/accounts/:account_id/categories" do
    let!(:expense_category) { create(:category, :expense, account:, name: "ランチ") }
    let!(:income_category) { create(:category, :income, account:, name: "給料") }

    it "returns categories that belong to the account" do
      get "/api/v1/accounts/#{account.id}/categories", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(parsed_body.pluck("name")).to include("ランチ", "給料")
    end

    it "filters by category type when type param is given" do
      get "/api/v1/accounts/#{account.id}/categories", params: { type: "income" }, headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(parsed_body.map { |item| item["name"] }).to eq(["給料"])
    end

    it "rejects users who are not members of the account" do
      get "/api/v1/accounts/#{account.id}/categories", headers: auth_headers(other_user)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/accounts/:account_id/categories" do
    let(:payload) do
      {
        category: {
          name: "交通費",
          type: "expense",
          color: "#123456",
          icon: "train",
          position: 1,
        },
      }
    end

    it "creates a category for account members" do
      expect do
        post "/api/v1/accounts/#{account.id}/categories", params: payload, headers: auth_headers(user), as: :json
      end.to change { account.categories.reload.count }.by(1)

      expect(response).to have_http_status(:created)
      expect(parsed_body).to include("name" => "交通費", "type" => "expense", "color" => "#123456")
    end

    it "prevents non members from creating categories" do
      post "/api/v1/accounts/#{account.id}/categories", params: payload, headers: auth_headers(other_user), as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /api/v1/accounts/:account_id/categories/:id" do
    let!(:category) { create(:category, :expense, account:, name: "旧カテゴリ") }

    it "updates the category attributes" do
      patch "/api/v1/accounts/#{account.id}/categories/#{category.id}",
            params: { category: { name: "新カテゴリ", color: "#abcdef" } },
            headers: auth_headers(user),
            as: :json

      expect(response).to have_http_status(:ok)
      expect(parsed_body).to include("name" => "新カテゴリ", "color" => "#abcdef")
    end
  end

  describe "DELETE /api/v1/accounts/:account_id/categories/:id" do
    context "when the category is unused" do
      let!(:category) { create(:category, :income, account:, name: "特別収入") }

      it "removes the category" do
        expect do
          delete "/api/v1/accounts/#{account.id}/categories/#{category.id}", headers: auth_headers(user), as: :json
        end.to change { account.categories.reload.count }.by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end

    context "when the category is referenced by transactions" do
      let!(:category) { create(:category, :expense, account:) }
      let!(:expense) { create(:expense, account:, user:, category:) }

      it "returns an error" do
        delete "/api/v1/accounts/#{account.id}/categories/#{category.id}", headers: auth_headers(user), as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(parsed_body["errors"]).to be_present
        expect(category.reload).to be_persisted
        expect(expense.reload.category).to eq(category)
      end
    end
  end
end
