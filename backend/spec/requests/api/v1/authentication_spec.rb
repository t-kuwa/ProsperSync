require "rails_helper"

RSpec.describe "API::V1::Authentication", type: :request do
  let(:headers) { {} }

  describe "POST /api/v1/users" do
    it "有効な情報でユーザー登録に成功する" do
      payload = {
        api_v1_user: attributes_for(:user, email: "alice@example.com")
      }

      post "/api/v1/users", params: payload, headers:, as: :json

      expect(response).to have_http_status(:created)
      expect(parsed_body.dig("user", "email")).to eq("alice@example.com")
      expect(parsed_body.fetch("primary_account")).to include("account_type" => "personal")
    end

    it "無効な情報だとバリデーションエラーになる" do
      payload = {
        api_v1_user: {
          name: "",
          email: "invalid",
          password: "short",
          password_confirmation: "mismatch"
        }
      }

      post "/api/v1/users", params: payload, headers:, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(parsed_body["errors"]).to be_present
    end
  end

  describe "POST /api/v1/login" do
    let!(:user) { create(:user, email: "bob@example.com", password: "password123") }

    it "正しい資格情報でJWTトークンを取得できる" do
      payload = {
        api_v1_user: {
          email: "bob@example.com",
          password: "password123"
        }
      }

      post "/api/v1/login", params: payload, headers:, as: :json

      expect(response).to have_http_status(:ok)
      expect(parsed_body["token"]).to be_present
      expect(parsed_body.dig("user", "email")).to eq("bob@example.com")
    end

    it "誤ったパスワードでは認証に失敗する" do
      payload = {
        api_v1_user: {
          email: "bob@example.com",
          password: "wrong-password"
        }
      }

      post "/api/v1/login", params: payload, headers:, as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/logout" do
    let!(:user) { create(:user, email: "charlie@example.com", password: "password123") }

    it "ログアウトでトークンが破棄される" do
      login_payload = {
        api_v1_user: {
          email: "charlie@example.com",
          password: "password123"
        }
      }

      post "/api/v1/login", params: login_payload, headers:, as: :json
      token = parsed_body["token"]

      delete "/api/v1/logout", headers: headers.merge("Authorization" => "Bearer #{token}"), as: :json

      expect(response).to have_http_status(:no_content)
    end
  end

  describe "POST /api/v1/users/password" do
    let!(:user) { create(:user, email: "dana@example.com") }

    it "パスワードリセットメールを送信する" do
      payload = {
        api_v1_user: {
          email: "dana@example.com"
        }
      }

      expect do
        post "/api/v1/users/password", params: payload, headers:, as: :json
      end.to change { ActionMailer::Base.deliveries.count }.by(1)

      expect(response).to have_http_status(:ok)
      expect(parsed_body["message"]).to include("パスワードリセットメール")
    end
  end

  describe "PUT /api/v1/users/password" do
    let!(:user) { create(:user, email: "eve@example.com", password: "password123") }

    it "有効なトークンでパスワードを更新できる" do
      token = user.send_reset_password_instructions

      payload = {
        api_v1_user: {
          reset_password_token: token,
          password: "newpassword123",
          password_confirmation: "newpassword123"
        }
      }

      put "/api/v1/users/password", params: payload, headers:, as: :json

      expect(response).to have_http_status(:ok)
      expect(parsed_body["message"]).to include("パスワードを更新しました")

      post "/api/v1/login", params: { api_v1_user: { email: "eve@example.com", password: "newpassword123" } }, headers:, as: :json
      expect(response).to have_http_status(:ok)
    end
  end
end
