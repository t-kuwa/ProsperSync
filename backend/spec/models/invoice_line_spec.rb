require "rails_helper"

RSpec.describe InvoiceLine do
  let(:invoice) { create(:invoice) }

  it "数量が1未満は無効であること" do
    line = build(:invoice_line, invoice:, quantity: 0)
    expect(line).to be_invalid
    expect(line.errors[:quantity]).to include("は1以上で入力してください")
  end

  it "単価が0以下は無効であること" do
    line = build(:invoice_line, invoice:, unit_price_minor: 0)
    expect(line).to be_invalid
    expect(line.errors[:unit_price_minor]).to include("は1以上で入力してください")
  end
end
