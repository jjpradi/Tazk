import React, {useState, Component, useContext, useEffect} from 'react';
import './login.css';
import LoginService from '../../../services/login_services';
import {useNavigate} from 'react-router-dom';
import {useSelector} from 'react-redux';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
// import Button from '@mui/material/Button'
import Cookies from 'universal-cookie';
import context from '../../../context/CreateNewButtonContext';
import {FailLoad, ListLoad} from '../../../redux/actions/load';
import {getusermenus} from '../../../redux/actions/role_actions';
import {updateUserCreationAction} from '../../../redux/actions/userCreation_actions';
import {useDispatch} from 'react-redux';
import {
  getLoginRoleAction,
  getLoginTokenAction,
} from '../../../redux/actions/userRole_actions';
import {listUserlocationsAction} from '../../../redux/actions/userCreation_actions';
import {sendNtfy} from '../../../firebase/firebase.service';
import {requestForToken} from '../../../firebase/firebase.service';
import notificationType from '../../../firebase/notify_type';
import ToastMessage from '../../../firebase/toast_notify';
import {ToastContainer, toast} from 'react-toast';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import { roleType } from 'utils/roleType';

const mode = 'login';

class LoginComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: this.props.mode,
    };
  }
  toggleMode() {
    var newMode = this.state.mode === 'login' ? 'signup' : 'login';
    this.setState({mode: newMode});
  }
  render() {
    return (
      <div>
        <div
          className={`form-block-wrapper form-block-wrapper--is-${this.state.mode}`}
        ></div>
        <section className={`form-block form-block--is-${this.state.mode}`}>
          <header className='form-block__header'>
            <h1>{this.state.mode === 'login' ? 'Welcome back!' : 'Sign up'}</h1>
            <div className='form-block__toggle-block'>
              {/* <span>{this.state.mode === 'login' ? 'Don\'t' : 'Already'} have an account? Click here &#8594;</span> */}
              {/* <input id="form-toggler" type="checkbox" onClick={this.toggleMode.bind(this)} /> */}
              {/* <label htmlFor="form-toggler"></label> */}
            </div>
          </header>
          <LoginForm
            {...this.props}
            mode={this.state.mode}
            onSubmit={this.props.onSubmit}
          />
        </section>
      </div>
    );
  }
}
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});
const LoginForm = (props) => {
  const [formdata, setFormData] = useState({username: '', password: ''});
  const [formErrors, setFormErrors] = useState({
    username: null,
    password: null,
  });
  const [requiredFields] = useState(['username', 'password']);
  // const [login, setLogin] = useState(false)
  const [disab, setdisab] = useState(false);
  const history = useNavigate();
  const [open, setOpen] = React.useState(false);
  // const [ success, setSuccess] = React.useState(false);
  const [msg, setMsg] = useState('');
  const [type, setType] = useState('');
  const [role, setRole] = useState('');
  const [token, setToken] = useState('');
  const dispatch = useDispatch();
  // const [Load, SetLoad] = useState(false)
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(context);
  const {
    UserRoleReducer: {loginToken, loginRole},
  } = useSelector((state) => state);

  const handleChange = async (name, value) => {
    // let {  value } = e.target;
    // setFormData({ ...formdata, name: value })
    setStateHandler(name, value);
    if (value !== null && value !== '') {
      setdisab(false);
    }
  };

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formdata,
      [name]: value,
    };
    await setFormData(formObj);
    validationHandler(name, value);
  };

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (
      requiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        (Object.keys(value) && value.value === null))
    ) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
    // setSuccess(false);
  };

  // useEffect(() => {
  //     dispatch(getLoginTokenAction())
  //     dispatch(getLoginRoleAction(formdata.username))
  // }, [])

  useEffect(() => {
    requestForToken(() => {}, setToken);
  }, []);

  const loginRes = async (e) => {
    e.preventDefault();

    let formErrorsObj = {...formErrors};
    await Object.keys(formdata).map((key, i) => {
      //  let isValid
      if (
        requiredFields.includes(key) &&
        (formdata[key] === null || formdata[key] === '')
      ) {
        // isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }
      return null;
    });
    await setFormErrors(formErrorsObj);

    try {
      if (
        formdata.username !== null &&
        formdata.username !== '' &&
        formdata.password !== null &&
        formdata.password !== ''
      ) {
        //  SetLoad(true)
        ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const loginApi = await LoginService.create(formdata);
        

        // dispatch(getLoginTokenAction())

        // SetLoad(false)
        if (loginApi.status === 200) {
          //   localStorage.setItem('moduless', JSON.stringify(loginApi.data))
          // const cookies = new Cookies();
          LoginService.setLogindate();
          sessionStorage.setItem('login', JSON.stringify(loginApi.data));
          history('/dashboard');
          dispatch(getusermenus(loginApi.data));

          let emp_id = sessionStorage.getItem('login')?.employee_id || '';
          let data = {token: token};
          dispatch(
            updateUserCreationAction(emp_id, data, (response) => {
              if (response) {
                dispatch(
                  getLoginRoleAction(emp_id, (role_name, token, content) => {
                    if (!roleType.includes(role_name)) {
                      let notify_type = notificationType('login');
                      let notify_content = content?.filter(
                        (m) => m.notification_type === notify_type,
                      );

                      if (notify_content.length) {
                        sendNtfy(
                        
                          token,
                        
                          notify_content[0]?.title,
                        
                          notify_content[0]?.body_msg,
                        
                        );
                      }
                    }
                    dispatch(CreateNotificationAction({content_body:role_name,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"}))
                  }),
                );
              }
            }),
          );
          dispatch(listUserlocationsAction(emp_id));
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } else {
        setOpen(true);
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        setMsg('Please Enter Username & Password');
        setType('warning');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setOpen(true);
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        setMsg('Username Or Password Invalid');
        setType('error');
      } else if(err.response?.status === 402) {
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        setOpen(true);
        setMsg('Approval Required');
        setType('error');
      } else {
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        setOpen(true);
        setMsg('Something went wrong. Please try again.');
        setType('error');
      }
    }
    return null;
  };

  const errorHandaler = () => {
    if (formdata.username === null || formdata.username === '') {
      setFormErrors({...formErrors, username: true});
    } else if (formdata.password === null || formdata.password === '') {
      setFormErrors({...formErrors, password: true});
    }
  };
  // const storeCollector = () => {
  //     let store = JSON.parse(localStorage.getItem('login'));
  //     if (store && store.login) {
  //         setFormData({ login: true, store: store })
  //         history('/dashboard');
  //     }
  // }
  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
      >
        <Alert onClose={handleClose} severity={type} sx={{width: '100%'}}>
          {msg}
        </Alert>
      </Snackbar>
      {/* <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={Load}
            // onClick={handleClose}
            >
                <CircularProgress color="primary" />
            </Backdrop> */}
      {/* <SimpleBackdrop Load={Load} /> */}
      <form action='/user' method='post'>
        <div className='form-block__input-wrapper'>
          <div className='form-group form-group--login'>
            <Input
              type='text'
              id='username'
              name='username'
              label='username'
              onChange={(e) => {
                handleChange('username', e.target.value);
              }}
              // onChange={(e) => { handleChange(e) }}
              disabled={props.mode === 'signup'}
              //value={formdata.username === null ? '' : formdata.username }
              onBlur={(e) => {
                handleChange(
                  'username',
                  e.target.value ? e.target.value : null,
                );
              }}
              error={formErrors.username === null ? '' : true}
            />
            {/* <span> {formErrors.username === null ? '' : 'Hii'}</span> */}
            <Input
              type='password'
              id='password'
              name='password'
              label='password'
              // onChange={(e) => { setFormData({ ...formdata, password: e.target.value }) }}
              onChange={(e) => {
                handleChange('password', e.target.value);
              }}
              onBlur={(e) => {
                handleChange(
                  'password',
                  e.target.value ? e.target.value : null,
                );
              }}
              error={formErrors.password === null ? '' : true}
              disabled={props.mode === 'signup'}
            />
          </div>
          <div className='form-group form-group--signup'>
            <Input
              type='text'
              id='fullname'
              label='full name'
              disabled={props.mode === 'login'}
            />
            <Input
              type='email'
              id='email'
              label='email'
              disabled={props.mode === 'login'}
            />
            <Input
              type='password'
              id='createpassword'
              label='password'
              disabled={props.mode === 'login'}
            />
            <Input
              type='password'
              id='repeatpassword'
              label='repeat password'
              disabled={props.mode === 'login'}
            />
          </div>
        </div>
        <button
          className='button button--primary full-width'
          style={{width: '100%'}}
          onClick={(e) => {
            loginRes(e);
            errorHandaler();
          }}
          type='submit'
          disabled={disab}
        >
          {props.mode === 'login' ? 'Log In' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

// class LoginForm extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             formdata:{email:'null',
//                      password:'null',},
//               login:'false',
//               store:'null',
//               checkerror : {email:'false', password:'false'}
//            }
//     }
//     componentDidMount(){
//         this.storeCollector()
//     }
//     login(e){
//         e.preventDefault();
//         fetch('http://localhost:4000/login',{
//             method:'POST',
//             body:JSON.stringify(this.state.formdata)
//         }).then((response)=>{response.json().then((result)=>{
//            console.warn('benazirr', result)
//            localStorage.setItem('login',JSON.stringify({
//                login:true,
//                token:result.accessToken,
//                token1:result.refreshToken,
//            }))
//            this.storeCollector()
//         })

//     })
//     }
//     storeCollector(){
//         let store=JSON.parse(localStorage.getItem('login'));
//         if(store && store.login){
//             this.setState({login:true,store:store})
//             this.props.history('/dashboard');
//         }
//     }
//     render() {
//         return (
//         <form>
//             <div className="form-block__input-wrapper">
//                 <div className="form-group form-group--login">
//                     <Input type="text" id="username" name="user" label="user name"
//                      onChange={(e)=>{this.setState({formdata:{...this.state.formdata,email: e.target.value}})}}
//                      disabled={this.props.mode === 'signup'}
//                      error={
//                          !this.props.value ? this.state.checkerror.email : false}/>
//                     <Input type="password" id="password" name="password" label="password" onChange={(e)=>{this.setState({formdata:{...this.state.formdata,password: e.target.value}})}} disabled={this.props.mode === 'signup'}/>
//                 </div>
//               <div className="form-group form-group--signup">
//                     <Input type="text" id="fullname" label="full name" disabled={this.props.mode === 'login'} />
//                     <Input type="email" id="email" label="email" disabled={this.props.mode === 'login'} />
//                     <Input type="password" id="createpassword" label="password" disabled={this.props.mode === 'login'} />
//                     <Input type="password" id="repeatpassword" label="repeat password" disabled={this.props.mode === 'login'} />
//                 </div>
//             </div>
//             <button className="button button--primary full-width" onClick={(e)=>{this.login(e)}} type="submit">{this.props.mode === 'login' ? 'Log In' : 'Sign Up'}</button>
//         </form>
//         )
//     }
// }

const Input = ({id, type, label, disabled, onChange, onBlur, value, error}) => (
  <input
    className='form-group__input'
    type={type}
    id={id}
    placeholder={label}
    disabled={disabled}
    onChange={onChange}
    onBlur={onBlur}
    value={value}
    style={{borderColor: error ? 'red' : ''}}
  />
);

const Login = (props) => (
  <div className={`app app--is-${mode}`}>
    <LoginComponent {...props} mode={mode} onSubmit={function () {}} />
  </div>
);
export default Login;
