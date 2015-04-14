require 'bundler/setup'
Bundler.require :default
require 'json'
require "net/https"

use Rack::Cors do
  allow do
    origins '*'

    resource '/pushtx',
        methods: [:post],
        max_age: 600
        # headers: 'x-domain-token',
        # expose:  ['Some-Custom-Response-Header'],
        # headers to expose
  end
end


class PushTx
  HOST = "blockchain.info"
  def push
    url = "https://#{HOST}/pushtx"
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE

    request = Net::HTTP::Get.new(uri.request_uri)

    response = http.request(request)
    puts "body"
    puts response.body
    puts "status"
    puts response.status
    puts

    # { tx: tx_hash },
  end
end


post "/pushtx" do
  content_type :json
  puts "PUSH TX"
  puts params[:tx].inspect
  puts
  PushTx.push
  puts
  { status: "pushed" }.to_json
end

run Sinatra::Application
