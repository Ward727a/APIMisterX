const express = require('express');
const admin = require('firebase-admin');

const {
    v4: uuidv4,
} = require('uuid');

const app = express();

const serviceAccount = require("./serviceaccountkey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://misterx-8c3e6-default-rtdb.europe-west1.firebasedatabase.app/',

    databaseAuthVariableOverride: {
        uid: "T19^$#J&wG#*69Rf!*Z6U0#9^e%3z79B"
    }
});

const database = admin.database();

const dbQuiz = database.ref('/quiz/');
const dbQuestion = database.ref('/question/');
const dbUser = database.ref('/user/');
const dbAdminKey = database.ref('/adminKey/')

app.use(express.json());

app.listen(process.env.PORT || 5000);

function checkKeyAdmin(adminKey, callback = function(args){}){

    dbAdminKey.get().then(DataSnapshot=>{
        let find = false;
        DataSnapshot.forEach(elem=>{
            if(elem.key === adminKey){
                if(elem.val() === true){
                    find = true;
                }
            }
        })

        callback(find);

    }).catch(err=>console.error(err));
}
function checkKey(key, callback = function(args){}){

    dbUser.get().then(DataSnapshot=>{
        let find = false;
        DataSnapshot.forEach(elem=>{
            if(elem.key === key){
                if(elem.val().valid === true){
                    find = true;
                }
            }
        })

        callback(find);

    }).catch(err=>console.error(err));
}

//FUN quiz

function APPCreateQuiz(res, UIDAuthor, quizName){

    console.log("createQuiz");

    const UID = uuidv4();

    dbQuiz.child(UID).set({
        author: UIDAuthor,
        title: quizName,
        uid: UID
    }).then(()=>{
        res.status(200).send({"ResultCode": 1, "Log": "Success, quiz created."})
    }).catch((err)=>{
        res.status(500).send({"ResultCode": 2, "Message": "Failed, question can't be created!.", "Error": err});
    })

}
function APPGetAllQuiz(res, key){

    console.log("GetAllQuestion");

    let data = {ResultCode: 1, message:"Data available.", data: [], length: 0};

    checkKey(key, args=>{
        if(args){

            dbQuiz.get().then(DataSnapshot=>{

                DataSnapshot.forEach(elem=>{
                    let quiz = {
                        author:elem.val().author,
                        title:elem.val().title,
                        uid: elem.val().uid
                    };

                    console.log(quiz);

                    data.data.push(quiz);
                    data.length++;
                })

                res.status(200).send(JSON.stringify(data));

            })

        } else {
            data = {"ResultCode": 2, message: "Key is unidentified!"};
            res.status(200).send(JSON.stringify(data));
        }
    })

}
function APPGetQuiz(res, key, uid, fullShow){

    console.log("GetQuestion");

    let data = {ResultCode: 1, message: "data available.", exist: false};

    checkKey(key, args=>{

        if(args){

            dbQuiz.child(uid).get().then(async DataSnapshot=>{

                let elem = DataSnapshot.val();

                data.exist = elem.author !== undefined;
                data.quiz = {
                    author: elem.author,
                    title: elem.title,
                    uid: elem.uid
                };


                if(fullShow){
                    data.quiz.author = await dbUser.child(elem.author).get().then(Data => {

                        return Data.val()

                    });
                }

                res.status(200).send(JSON.stringify(data));

            }).catch(err=>{

                console.error(err);

                res.status(200).send(JSON.stringify(data))
            })

        } else {

            data.ResultCode = 2;
            data.message = "Key is unidentified."

            res.status(200).send(JSON.stringify(data));
        }

    })
}

function APPEditQuiz(res, key, quiz){

    function update(){

        let data = database.ref("/quiz/"+quiz.uid);

        data.child("title").set(quiz.title).then(function(){

            res.status(200).send({"ResultCode":1,"message":"Quiz edited!"})

        })

    }

    checkKey(key, args=>{
        if(args){

            update();

        } else {
            checkKeyAdmin(key, args=>{

                if(args){

                    update();

                } else {

                    res.status(200).send({"ResultCode":2,"message":"Key is invalid!"})

                }

            })
        }
    })

}

//FUN question

function APPCreateQuestion(res, UIDAuthor, questionName, questionResponse, questionFalseResponse, forQuiz, order){

    console.log("createQuestion");

    const UID = uuidv4();

    dbQuestion.child(UID).set({
        author: UIDAuthor,
        question: questionName,
        response: questionResponse,
        falseResponse: questionFalseResponse,
        uidQuiz: forQuiz,
        order: order,
        uid: UID
    }).then(()=>{
        res.status(200).send({"ResultCode": 1, "Log": "Success, question created."})
    }).catch((err)=>{
        res.status(500).send({"ResultCode": 2, "Message": "Failed, question can't be created!.", "Error": err});
    })

}

function APPGetAllQuestion(res, key){

    console.log("GetAllQuestion");

    let data = {ResultCode: 1, message:"Data available.", data: [], length: 0};

    checkKey(key, args=>{
        if(args){

            dbQuestion.get().then(DataSnapshot=>{

                DataSnapshot.forEach(elem=>{
                    let question = {
                        author:elem.val().author,
                        falseResponse:elem.val().falseResponse,
                        order: elem.val().order,
                        question: elem.val().question,
                        response: elem.val().response,
                        uid: elem.val().uid,
                        quiz: elem.val().uidQuiz
                    };

                    console.log(question);

                    data.data.push(question);
                    data.length++;
                })

                res.status(200).send(JSON.stringify(data));

            })

        } else {
            data = {"ResultCode": 2, message: "Key is unidentified!"};
            res.status(200).send(JSON.stringify(data));
        }
    })

}

function APPGetQuestion(res, key, uid, fullShow = false){

    console.log("GetQuestion");

    let data = {ResultCode: 1, message: "data available.", exist: false};

    checkKey(key, args=>{

        if(args){

            dbQuestion.child(uid).get().then(async DataSnapshot=>{

                let elem = DataSnapshot.val();

                data.exist = elem.author !== undefined;
                data.question = {
                    author: elem.author,
                    question: elem.question,
                    response: elem.response,
                    falseResponse: elem.falseResponse,
                    uidQuiz: elem.uidQuiz,
                    order: elem.order,
                    uid: elem.uid
                };

                if(fullShow){
                    data.question.author = await dbUser.child(elem.author).get().then(Data => {

                        return Data.val()

                    });
                }

                res.status(200).send(JSON.stringify(data));

            }).catch(err=>{

                console.error(err);

                res.status(200).send(JSON.stringify(data))
            })

        } else {

            data.ResultCode = 2;
            data.message = "Key is unidentified."

            res.status(200).send(JSON.stringify(data));
        }

    })
}

function APPEditQuestion(res, key, question){

    function update(){

        let data = database.ref("/question/"+question.uid);

        data.child("falseResponse").set(question.falseResponse);
        data.child("question").set(question.name);
        data.child("response").set(question.response);
        data.child("uidQuiz").set(question.forQuiz);

        data.child("order").set(question.order).then(function(){

            res.status(200).send({"ResultCode":1,"message":"Question edited!"})

        })
    }

    checkKey(key, args=>{
        if(args){

            update();

        } else {
            checkKeyAdmin(key, key=>{

                if(key){

                    update();

                } else {

                    res.status(200).send({"ResultCode":2,"message":"Key is invalid!"})

                }

            })
        }
    })

}

//FUN user

function APPCreateUser(res, adminKey, username){

    console.log("createUser");

    const UID = uuidv4();

    dbUser.child(UID).set({
        adminKey: adminKey,
        username: username,
        uid: UID
    }).then(()=>{
        res.status(200).send({"ResultCode": 1, "Log": "Success, user created."})
    }).catch((err)=>{
        res.status(500).send({"ResultCode": 2, "Message": "Failed, user can't be created!.", "Error": err});
    })

}

function APPGetAllUser(res, adminKey){

    console.log("GetAllUser");

    let data = {ResultCode: 1, message:"Data available.", users: [], length: 0};

    checkKeyAdmin(adminKey, args=>{
        if(args){

            dbUser.get().then(DataSnapshot=>{

                DataSnapshot.forEach(elem=>{
                    let user = {
                        username:elem.val().username,
                        byKey:elem.val().adminKey,
                        UID: elem.val().uid
                    };

                    console.log(user);

                    data.users.push(user);
                    data.length++;
                })

                res.status(200).send(JSON.stringify(data));

            })

        } else {
            data = {"ResultCode": 2, message: "Admin key is unidentified!"};
            res.status(200).send(JSON.stringify(data));
        }
    })

}

function APPEditUser(res, user, adminKey) {

    checkKeyAdmin(adminKey, args=>{
        if(args){
            if(user.resetPassword){
                database.ref("/user/" + user.uid).child("password").set("").then(function (){
                    res.status(200).send({"ResultCode":1,"message":"Password reset!"})
                });
            }

            database.ref("/user/" + user.uid).child("username").set(user.username).then(function (){
                res.status(200).send({"ResultCode":1,"message":"Username changed!"})
            });

        } else {

            res.status(200).send({"ResultCode":2,"message":"Key is invalid!"})

        }
    })

}

//FUN admin

function ADMINCheckKey(res, adminKey){

    console.log("checkKeyAdmin");

    dbAdminKey.get().then(DataSnapshot=>{
        let find = false;
        DataSnapshot.forEach(elem=>{
            if(elem.key === adminKey){
                if(elem.val() === true){
                    res.status(200).send({"ResultCode": 1});
                } else {
                    console.log(elem.val());
                    res.status(200).send({"ResultCode": 2});
                }
                find = true;
            }
        })
        if(!find) res.status(200).send({"ResultCode": 3});

    }).catch(err=>console.error(err));

}

// REQUEST

app.post('/app/quiz', (req, res)=>{
    const author = req.body.UIDAuthor;
    const name = req.body.title;

    APPCreateQuiz(res, author, name);
})
app.post('/app/question', (req, res)=>{
    const author = req.body.UIDAuthor;
    const name = req.body.name;
    const response = req.body.response;
    const falseResponse = req.body.falseResponse;
    const uidQuiz = req.body.uidQuiz;
    const order = req.body.order;

    APPCreateQuestion(res, author, name, response, falseResponse, uidQuiz, order);
})
app.post('/app/user', (req, res)=>{
    const adminKey = req.body.adminKey;
    const username = req.body.username;

    APPCreateUser(res, adminKey, username);
})
app.get('/app/admin/check', (req, res) => {
    const adminKey = req.query.adminKey;

    ADMINCheckKey(res, adminKey);
})
app.get('/app/user/getAll', (req, res)=>{
    const adminKey = req.query.adminKey;

    APPGetAllUser(res, adminKey);
})
app.get('/app/question/getAll', (req, res)=>{
    const key = req.query.key;

    APPGetAllQuestion(res, key);
})
app.get('/app/quiz/getAll', (req, res)=>{
    const key = req.query.key;

    APPGetAllQuiz(res, key);
})
app.get('/app/question', (req, res)=>{
    const key = req.query.key;
    const uid = req.query.uid;
    let fullShow = false;

    if(req.query.fullShow) fullShow = true;

    APPGetQuestion(res, key, uid, fullShow);
})
app.get('/app/quiz', (req, res)=>{
    const key = req.query.key;
    const uid = req.query.uid;
    let fullShow = false;

    if(req.query.fullShow) fullShow = true;

    APPGetQuiz(res, key, uid, fullShow);
})
app.post('/app/user/change', (req, res) => {

    const adminKey = req.body.adminKey;
    const uid = req.body.uid;
    const username = req.body.username;
    const resetPassword = req.body.resetPassword;

    const user = {
        uid: uid,
        username: username,
        resetPassword: resetPassword
    }

    APPEditUser(res, user, adminKey);

})
app.post('/app/question/change', (req, res) => {

    const key = req.body.key;
    const uid = req.body.uid;
    const name = req.body.name;
    const response = req.body.response;
    const falseResponse = req.body.falseResponse;
    const forQuiz = req.body.forQuiz;
    const order = req.body.order;

    const question = {
        uid: uid,
        name: name,
        response: response,
        falseResponse: falseResponse,
        forQuiz: forQuiz,
        order: order
    }

    APPEditQuestion(res,key,question);

})
app.post('/app/quiz/change', (req, res) => {

    const key = req.body.key;

    const uid = req.body.uid;
    const title = req.body.title;

    const quiz ={

        uid: uid,
        title: title

    }

    APPEditQuiz(res, key, quiz);

})
