require "rails_helper"

RSpec.describe Workspace::ProvisionPersonal, type: :service do
  describe ".call" do
    let(:user) do
      allow(Workspace::ProvisionPersonal).to receive(:call)
      create(:user)
    end

    before do
      allow(Workspace::ProvisionPersonal).to receive(:call).and_call_original
    end

    it "creates a personal account, membership, and sets primary_account" do
      expect do
        described_class.call(user: user)
      end.to change(Account, :count).by(1).and change(Membership, :count).by(1)

      account = user.accounts.personal.first
      expect(account).to be_present
      expect(user.reload.primary_account).to eq(account)
      membership = account.memberships.find_by(user: user)
      expect(membership).to be_owner
    end

    it "is idempotent and returns existing account" do
      first = described_class.call(user: user)

      expect do
        second = described_class.call(user: user)
        expect(second).to eq(first)
      end.not_to change(Account, :count)
    end
  end
end
