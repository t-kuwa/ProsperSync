require "rails_helper"

RSpec.describe Invoice do
  let(:issuer_account) { create(:account) }
  let(:payer_account) { create(:account) }

  it "有効な請求書は保存できること" do
    invoice = build(:invoice, issuer_account:, payer_account:)
    expect(invoice).to be_valid
  end

  it "amount_minorが0以下の場合は無効になること" do
    invoice = build(:invoice, issuer_account:, payer_account:, amount_minor: 0)
    expect(invoice).to be_invalid
    expect(invoice.errors[:amount_minor]).to include("は1以上で入力してください")
  end

  it "issuer_accountとpayer_accountが必須であること" do
    invoice = build(:invoice, issuer_account: nil, payer_account: nil)
    expect(invoice).to be_invalid
    expect(invoice.errors[:issuer_account]).to be_present
    expect(invoice.errors[:payer_account]).to be_present
  end

  it "同一発行者内でinvoice_numberが重複すると無効になること" do
    create(:invoice, issuer_account:, payer_account:, invoice_number: "INV-001")
    dup = build(:invoice, issuer_account:, payer_account:, invoice_number: "INV-001")

    expect(dup).to be_invalid
    expect(dup.errors[:invoice_number]).to be_present
  end
end
