json.id income.id
json.account_id income.account_id
json.user_id income.user_id
json.category_id income.category_id
json.title income.title
json.amount income.amount
json.received_on income.received_on
json.memo income.memo
json.created_at income.created_at
json.updated_at income.updated_at

if income.category
  json.category do
    json.partial! "api/v1/categories/category", category: income.category
  end
end

if income.user
  json.user do
    json.id income.user.id
    json.name income.user.name
    json.email income.user.email
  end
end
