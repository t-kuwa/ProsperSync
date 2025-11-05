require "rails_helper"

RSpec.describe Memberships::Updater, type: :service do
  let(:account) { create(:account) }
  let!(:owner_membership) { create(:membership, :owner, account:) }
  let!(:member_membership) { create(:membership, account:) }

  describe ".call" do
    context "有効なパラメータの場合" do
      it "メンバーシップのロールを更新すること" do
        described_class.call(membership: member_membership, new_role: :owner)
        expect(member_membership.reload.role).to eq("owner")
      end
    end

    context "最後のオーナーを降格させる場合" do
      it "LastOwnerErrorを発生させること" do
        expect do
          described_class.call(membership: owner_membership, new_role: :member)
        end.to raise_error(Memberships::Updater::LastOwnerError)
      end
    end

    context "新しいロールが同じ場合" do
      it "エラーを発生させず、ロールも変更しないこと" do
        expect do
          described_class.call(membership: owner_membership, new_role: :owner)
        end.not_to raise_error
        expect(owner_membership.reload.role).to eq("owner")
      end
    end

    context "他にオーナーがいる場合" do
      before do
        create(:membership, :owner, account: account)
      end

      it "オーナーの一人を降格できること" do
        expect do
          described_class.call(membership: owner_membership, new_role: :member)
        end.not_to raise_error
        expect(owner_membership.reload.role).to eq("member")
      end
    end
  end
end
