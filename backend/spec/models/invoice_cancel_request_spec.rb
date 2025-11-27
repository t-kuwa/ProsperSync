require "rails_helper"

RSpec.describe InvoiceCancelRequest do
  let(:invoice) { create(:invoice, status: :issued) }
  let(:user) { create(:user) }

  it "pendingの申請は作成できること" do
    request = build(:invoice_cancel_request, invoice:, requested_by: user)
    expect(request).to be_valid
    expect(request.status).to eq("pending")
  end
end
