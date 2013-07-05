class ApplicationController < ActionController::Base
  require_dependency "#{Rails.root}/lib/refinery/news/item"
  require_dependency "#{Rails.root}/lib/refinery/page"
  require_dependency "#{Rails.root}/lib/refinery/search_engine"
  protect_from_forgery
end
