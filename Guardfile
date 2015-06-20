guard 'sass', input: 'sass', output: 'css'

def msg(type, m)
  m[0] + " has changed."
end

def exc(cmd)
  puts "executing: #{cmd}"
  puts `#{cmd}`
  true
end

guard :shell do
  watch /index\.js$/ do |m|
    msg :change, m
    exc "sh build.sh"
  end

  watch /index\.haml$/ do |m|
    msg :change, m
    # TODO: if command not found: echo "run: 'gem install haml-contrib' to install html2haml"
    exc "html2haml index"
  end
end
