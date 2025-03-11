const http = require("http");
const fs = require("fs");
const port = 8080;
const cors = require("cors");
const { log } = require("console");

const server = http.createServer((req, res) => {
    cors()(req, res, () => {
      
        res.writeHead(200, { "Content-Type": "text/plain" });

        if (req.method === "GET" && req.url === "/product") {
            fs.readFile("./db.json", "utf-8", (err, data) => {
                if (err) {
                    res.end(err);
                } else {
                    res.end(data);
                }
            });
        } 
        else if (req.method === "GET" && req.url.startsWith("/product/")) {
            let productId = req.url.split("/")[2];

            fs.readFile("./db.json", "utf-8", (err, data) => {
                if (err) {
                    res.end(JSON.stringify({ error: "Error reading data" }));
                } else {
                    const products = JSON.parse(data).products;
                    const product = products.find((el) => el.id == productId);

                    if (product) {
                        res.end(JSON.stringify(product));
                    } else {
                        res.end(JSON.stringify({ error: "Product not found" }));
                    }
                }
            });
        } 
        else if (req.method === "POST" && req.url === "/addproduct") {
            
         let str=""
         req.on("data",(chunk)=>{
            str+=chunk
         })
         req.on("close",()=>{
            const coredata = JSON.parse(str);
            console.log(coredata );
            fs.readFile("./db.json","utf-8",(err,data)=>{
                if (err) {
                    res.end(err)
                }else{
                    const productparse = JSON.parse(data)
                    productparse.products.push({...coredata,id:Date.now()})
    
                    fs.writeFile("./db.json",JSON.stringify(productparse),(err)=>{
                        if (err) {
                            res.end(err)
                        }else{
                            res.end("Product Added")
                        }
                    })
                }
              })
         })
         
         
        }else if(req.method === "DELETE"  && req.url.startsWith("/deleteproduct/")){
            let uid = req.url.split("/")[2]
            fs.readFile("./db.json","utf-8",(err,data)=>{
                if (err) {
                    res.end(err)
                }else{
                    const deleteparse = JSON.parse(data)
                    console.log(deleteparse);
                    let FinalDatafilter= deleteparse.products.filter((el) => el.id != uid);
                    console.log(FinalDatafilter);
                    fs.writeFile("./db.json",JSON.stringify({products:FinalDatafilter}),(err)=>{
                        if (err) {
                            res.end(err)
                        }else{
                            res.end("Product Deleted")
                        }
                    })
                    
                }
            })
        } 
        else if (req.method === "PUT" && req.url.startsWith("/updateproduct/")) {
            let uid = req.url.split("/")[2];
            let str = "";
        
            req.on("data", (chunk) => {
                str += chunk;
            });
        
            req.on("end", () => {
                const updatedProduct = JSON.parse(str);
        
                fs.readFile("./db.json", "utf-8", (err, data) => {
                    if (err) {
                        res.end(err);
                    } else {
                        const editparse = JSON.parse(data);
                        let editproduct = editparse.products;
        
                        
                        let updatedProducts = editproduct.map((el) =>
                            el.id == uid ? { ...el, ...updatedProduct } : el
                        );
        
                    
                        if (JSON.stringify(editproduct) === JSON.stringify(updatedProducts)) {
                            res.end("Product Not Found");
                        } else {
                            fs.writeFile("./db.json", JSON.stringify({ products: updatedProducts }), (err) => {
                                if (err) {
                                    res.end(err);
                                } else {
                                    res.end("Product Updated");
                                }
                            });
                        }
                    }
                });
            });
        }
        
        else {
            res.end("end-point not match");
        }
    });
});

server.listen(port, () => {
    console.log(`Server is running at ${port}`);
});

