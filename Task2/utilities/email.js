const axios = require('axios');
const formData = require('form-data');

async function welcomeemail(email, name, otpResult, templateId){
    console.log('otp', otpResult);
    // console.log("ty",email,name);
    // console.log(process.env.DAKIA_HASH_KEY)
    // console.log("templateid",templateId)
  try{
    const form = new formData({ maxDataSize: Infinity });
        form.append("operation", "send_email");
        form.append("sender_name", 'QueryQ');""
        form.append("email_body", "https://oneid.veevotech.com/index?action=allow_app&app_segment_type=consumer&enroll_me_at_app=12345&enroll_app_ref=abc123xyz789&teamId=98765&app_id=12345")
        form.append( "hashkey", process.env.DAKIA_HASH_KEY);
        form.append("receiver_emails", email);
        form.append("template", templateId);
        form.append("sender_email", "care@veevotech.com");
        form.append("template_parameters",JSON.stringify({"NAME":name, "OTP":otpResult, "ORGANIZATION_NAME":"VeevoTech"}));
        form.append("email_subject","OTP Verification");
    // form.append("message", `<h3> We are hapy to see you again ${name}</h3>`);
        
    const response = await axios.post(
         "https://dakia.veevotech.com/send_email_v2",
          form,
         {
             headers: form.getHeaders()
         }
    );
    console.log('email sent Successfully with otp:',response.data)

  }catch(error){
    if (error.response) {
        console.log('Dakia error response:', error.response.data);
    } else {
        console.log('Error sending email:', error.message);
    }
      
    }
   
} 
module.exports =welcomeemail