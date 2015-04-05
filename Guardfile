guard 'sass', input: 'sass', output: 'css'

guard :shell do
  watch /index\.js$/ do |m|
    m[0] + " has changed."
    cmd = "sh browserify.sh"
    puts "executing: #{cmd}"
    puts `#{cmd}`
    true
  end
end
