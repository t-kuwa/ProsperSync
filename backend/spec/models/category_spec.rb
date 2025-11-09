require "rails_helper"

RSpec.describe Category, type: :model do
  describe "validations" do
    subject(:category) { build(:category) }

    it "デフォルトの属性で有効であること" do
      expect(category).to be_valid
    end

    it "カテゴリ名が必須であること" do
      category.name = nil
      expect(category).to be_invalid
      expect(category.errors[:name]).to include("can't be blank")
    end

    it "カテゴリ名が50文字以内であること" do
      category.name = "a" * 51
      expect(category).to be_invalid
      expect(category.errors[:name]).to include("is too long (maximum is 50 characters)")
    end

    it "アカウント内で同じ種別のカテゴリ名が一意であること" do
      account = create(:account)
      create(:category, account:, name: "食費", type: :expense)
      duplicate = build(:category, account:, name: "食費", type: :expense)

      expect(duplicate).to be_invalid
      expect(duplicate.errors[:name]).to include("has already been taken")
    end

    it "異なる種別では同じカテゴリ名を使用できること" do
      account = create(:account)
      create(:category, account:, name: "その他", type: :expense)
      different_type = build(:category, account:, name: "その他", type: :income)

      expect(different_type).to be_valid
    end

    it "異なるアカウントでは同じカテゴリ名を使用できること" do
      account1 = create(:account)
      account2 = create(:account)
      create(:category, account: account1, name: "食費", type: :expense)
      different_account = build(:category, account: account2, name: "食費", type: :expense)

      expect(different_account).to be_valid
    end

    it "色がHEXコード形式であること" do
      category.color = "#FF5733"
      expect(category).to be_valid
    end

    it "色が不正な形式の場合、無効であること" do
      category.color = "invalid"
      expect(category).to be_invalid
      expect(category.errors[:color]).to be_present
    end

    it "色が空の場合は有効であること" do
      category.color = nil
      expect(category).to be_valid
    end
  end

  describe "associations" do
    it "アカウントに属すること" do
      account = create(:account)
      category = create(:category, account:)

      expect(category.account).to eq(account)
    end

    it "支出を持つこと" do
      category = create(:category, :expense)
      expense = create(:expense, category:)

      expect(category.expenses).to include(expense)
    end

    it "収入を持つこと" do
      category = create(:category, :income)
      income = create(:income, category:)

      expect(category.incomes).to include(income)
    end

    it "使用中のカテゴリを削除できないこと" do
      category = create(:category, :expense)
      create(:expense, category:)

      expect(category.destroy).to be_falsey
      expect(category.errors[:base]).to be_present
      expect(Category.find_by(id: category.id)).to be_present
    end
  end

  describe "enums" do
    it "種別がexpenseとincomeを持つこと" do
      expect(Category.types).to include("expense", "income")
    end
  end

  describe "scopes" do
    it "for_expenseスコープが支出カテゴリを返すこと" do
      expense_category = create(:category, :expense)
      income_category = create(:category, :income)

      expect(Category.for_expense).to include(expense_category)
      expect(Category.for_expense).not_to include(income_category)
    end

    it "for_incomeスコープが収入カテゴリを返すこと" do
      expense_category = create(:category, :expense)
      income_category = create(:category, :income)

      expect(Category.for_income).to include(income_category)
      expect(Category.for_income).not_to include(expense_category)
    end

    it "orderedスコープがpositionとnameでソートすること" do
      account = create(:account)
      category1 = create(:category, account:, name: "B", position: 2)
      category2 = create(:category, account:, name: "A", position: 1)
      category3 = create(:category, account:, name: "C", position: 1)

      expect(Category.ordered).to eq([category2, category3, category1])
    end
  end
end

