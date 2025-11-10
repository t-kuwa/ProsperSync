json.id expense.id
json.account_id expense.account_id
json.user_id expense.user_id
json.category_id expense.category_id
json.title expense.title
json.amount expense.amount
json.spent_on expense.spent_on
json.memo expense.memo
json.created_at expense.created_at
json.updated_at expense.updated_at

if expense.category
  json.category do
    json.partial! "api/v1/categories/category", category: expense.category
  end
end

if expense.user
  json.user do
    json.id expense.user.id
    json.name expense.user.name
    json.email expense.user.email
  end
end
