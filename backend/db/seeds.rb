# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# 初期のデータを作成
# user = User.create!(name: "Tomoya", email: "test@example.com", password: "password")
# household = Account.create!(name: "テストアカウント", owner: user)
# Expense.create!(account: household, user:, category: "食費", amount: 1200, spent_on: Date.today)
# Income.create!(account: household, user:, category: "給与", amount: 200000, received_on: Date.today)
