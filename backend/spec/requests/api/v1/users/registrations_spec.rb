require "rails_helper"

RSpec.describe "API::V1::Users::Registrations", type: :request do
  it "ユーザーを作成し、プライマリアカウント情報を返すこと" do
    allow(Workspace::ProvisionPersonal).to receive(:call).and_call_original

    post "/api/v1/users", params: { api_v1_user: attributes_for(:user) }, as: :json

    expect(response).to have_http_status(:created)
    body = parsed_body
    expect(body.dig("user", "primary_account_id")).to be_present
    expect(body.fetch("primary_account")).to include("account_type" => "personal")
  end
end
