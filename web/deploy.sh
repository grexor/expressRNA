cp *.html deploy/
cp *.css deploy/

cp -ap docs deploy/
cp -ap media deploy/
cp -ap software deploy/
cp -ap tippy deploy/

# obfuscate Javascript

js_files=`ls *.js`
for fname in $js_files
do
  ./node_modules/.bin/javascript-obfuscator $fname --output deploy/$fname
done

cp -r deploy/* /home/gregor/expressrna/web/

cp /home/gregor/expressrna_dev/web/expressrna_py/index.py /home/gregor/expressrna/web/expressrna_py/index.py
