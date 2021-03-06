import { Component, OnInit, AfterViewInit, NgModule, ElementRef, ViewChild, HostListener } from '@angular/core';
import { RequestsService } from '../../services/requests.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../core/auth.service';
import { UsersService } from '../../services/users.service';
import { Project } from '../../models/project-model';
// import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
// import { SharedModule } from '../../shared/shared.module';
import { UsersLocalDbService } from '../../services/users-local-db.service';
import { NotifyService } from '../../core/notify.service';
import { environment } from '../../../environments/environment';
import { UploadImageService } from '../../services/upload-image.service';
import { TranslateService } from '@ngx-translate/core';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

//    export const ROUTES: RouteInfo[];
//  = [
//     { path: `project/${this.projectid}/home`, title: 'Home', icon: 'dashboard', class: '' },
//     { path: 'requests', title: 'Visitatori', icon: 'group', class: '' },
//     { path: 'chat', title: 'Chat', icon: 'chat', class: '' },
//     // { path: 'analytics', title: 'Analytics', icon: 'trending_up', class: '' },
//     // MOVED IN THE TEMPLATE: IS NECESSARY TO MANAGE THE SETTING SUB MENU
//     // { path: 'settings', title: 'Impostazioni',  icon: 'settings', class: '' },

//     // { path: 'dashboard', title: 'Dashboard', icon: 'dashboard', class: '' },
//     // { path: 'user-profile', title: 'User Profile', icon: 'person', class: '' },
//     // { path: 'table-list', title: 'Table List', icon: 'content_paste', class: '' },
//     // { path: 'typography', title: 'Typography', icon: 'library_books', class: '' },
//     // { path: 'icons', title: 'Icons', icon: 'bubble_chart', class: '' },
//     // { path: 'maps', title: 'Maps', icon: 'location_on', class: '' },
//     // { path: 'notifications', title: 'Notifications', icon: 'notifications', class: '' },
//     // { path: 'upgrade', title: 'Upgrade to PRO', icon: 'unarchive', class: 'active-pro' },
// ];

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, AfterViewInit {

    @ViewChild('openchatbtn') private elementRef: ElementRef;
    @ViewChild('homebtn') private homeBtnElement: ElementRef;

    menuItems: any[];

    checked_route: string;

    // SHOW_SETTINGS_SUBMENU = false;
    SHOW_SETTINGS_SUBMENU = false;
    SETTINGS_SUBMENU_WAS_OPEN: any;

    // FOR THE CARETS IN SIDEBAR IN MOBILE MODE
    SHOW_PRJCT_SUB = false;
    SHOW_PROFILE_SUB = false;

    // NO MORE USED
    // isActive: string;

    // switch up and down the caret of menu item settings
    // trasform = 'none';
    trasform = 'none';
    trasform_projectname_caret = 'none';
    transform_user_profile_caret = 'none';

    unservedRequestCount: number;

    // route: string;
    LOGIN_PAGE: boolean;
    // IS_UNAVAILABLE = false;
    IS_AVAILABLE: boolean;
    projectUser_id: string;

    project: Project;
    projectId: string;
    user: any;

    ROUTES: RouteInfo[];
    displayLogoutModal = 'none';

    USER_ROLE: string;

    currentUserId: string

    CHAT_BASE_URL = environment.chat.CHAT_BASE_URL

    userProfileImageExist: boolean;
    userImageHasBeenUploaded: boolean;

    IS_MOBILE_MENU: boolean;
    scrollpos: number;
    elSidebarWrapper: any;

    changeAvailabilitySuccessNoticationMsg: string;
    changeAvailabilityErrorNoticationMsg: string;

    isOverAvar = false;
    constructor(
        private requestsService: RequestsService,
        private router: Router,
        public location: Location,
        private route: ActivatedRoute,
        // private projectService: ProjectService,
        private auth: AuthService,
        private usersService: UsersService,
        private usersLocalDbService: UsersLocalDbService,
        private notify: NotifyService,
        private uploadImageService: UploadImageService,
        private translate: TranslateService
    ) { console.log('!!!!! HELLO SIDEBAR') }


    ngOnInit() {
        this.translateChangeAvailabilitySuccessMsg();
        this.translateChangeAvailabilityErrorMsg();

        // !!!! NO MORE USED
        // this.ROUTES = [
        //     { path: `project/${this.projectid}/home`, title: 'Home', icon: 'dashboard', class: '' },
        //     { path: `project/${this.projectid}/requests`, title: 'Visitatori', icon: 'group', class: '' },
        //     { path: 'chat', title: 'Chat', icon: 'chat', class: '' }
        // ]
        // this.menuItems = this.ROUTES.filter(menuItem => menuItem);

   
        // WHEN THE PAGE IS REFRESHED GETS FROM LOCAL STORAGE IF THE SETTINGS SUBMENU WAS OPENED OR CLOSED
        // this.SETTINGS_SUBMENU_WAS_OPEN = localStorage.getItem('show_settings_submenu')
        // console.log('LOCAL STORAGE VALU OF KEY show_settings_submenu', localStorage.getItem('show_settings_submenu'))
        // this.SHOW_SETTINGS_SUBMENU = this.SETTINGS_SUBMENU_WAS_OPEN
        // console.log('ON INIT - SHOW SETTINGS SUBMENU ', this.SHOW_SETTINGS_SUBMENU)
        // if (localStorage.getItem('show_settings_submenu') === 'true') {
        //     this.trasform = 'rotate(180deg)';
        // } else {
        //     this.trasform = 'none';
        // }
        this.getLoggedUser();
        this.getCurrentProject();

        this.getUserAvailability();
        this.getProjectUserId();

        this.getProjectUserRole();

        this.hasChangedAvailabilityStatusInUsersComp();

        this.checkUserImageUploadIsComplete();
        // used when the page is refreshed
        this.checkUserImageExist();
    }

    translateChangeAvailabilitySuccessMsg() {
        this.translate.get('ChangeAvailabilitySuccessNoticationMsg')
            .subscribe((text: string) => {

                this.changeAvailabilitySuccessNoticationMsg = text;
                console.log('+ + + change Availability Success Notication Msg', text)
            });
    }

    translateChangeAvailabilityErrorMsg() {
        this.translate.get('ChangeAvailabilityErrorNoticationMsg')
            .subscribe((text: string) => {

                this.changeAvailabilityErrorNoticationMsg = text;
                console.log('+ + + change Availability Error Notication Msg', text)
            });
    }


    checkUserImageExist() {
        this.usersService.userProfileImageExist.subscribe((image_exist) => {
            console.log('SIDEBAR - USER PROFILE EXIST ? ', image_exist);
            this.userProfileImageExist = image_exist;
        });
    }
    checkUserImageUploadIsComplete() {
        this.uploadImageService.imageExist.subscribe((image_exist) => {
            console.log('SIDEBAR - IMAGE UPLOADING IS COMPLETE ? ', image_exist);
            this.userImageHasBeenUploaded = image_exist;
        });
    }

    getProjectUserRole() {
        this.usersService.project_user_role_bs.subscribe((user_role) => {
            this.USER_ROLE = user_role;
            console.log('!!! SIDEBAR - 1. SUBSCRIBE PROJECT_USER_ROLE_BS ', this.USER_ROLE);
            if (this.USER_ROLE) {
                console.log('SIDEBAR - PROJECT USER ROLE ', this.USER_ROLE);
                if (this.USER_ROLE === 'agent') {
                    this.SHOW_SETTINGS_SUBMENU = false;
                }
            }
            //  else {
            //     // used when the page is refreshed
            //     // this.USER_ROLE = this.usersLocalDbService.getUserRoleFromStorage();

            //     /*  IF USER_ROLE IS NULL FROM SUBSCRIPTION IS GOT FROM THE getProjectUser CALLBACK */
            //     console.log('!!! SIDEBAR - 2. PROJECT_USER_ROLE_BS IS NULL GET USER ROLE FROM getProjectUser CALLBACK ', this.USER_ROLE);
            //     if (this.USER_ROLE === 'agent') {
            //         this.SHOW_SETTINGS_SUBMENU = false;
            //     }
            // }
        });
    }

    // ============ SUBSCRIPTION TO user_is_available_bs  AND project_user_id_bs PUBLISHED BY THE USER SERVICE USED
    /* WF: when the user select A PROJECT,
       - in the HOME COMP is made a call-back to get the PROJECT-USER OBJECT
         (filtering all PROJECT-USER OBJECTS the  by the id of the logged user and by the id of the project selected)
       - the HOME COMP PASS THE PROJECT-USER AVAILABILITY AND THE PROJECT-USER ID TO THE  USER SERVICE
       - the USER-SERVICE PUBLISH THE PROJECT-USER AVAILABILITY AND THE PROJECT-USER ID
       - the SIDEBAR (this component) SUBSCRIBES THESE VALUES TO PERFORM the updateProjectUser()
    */
    getUserAvailability() {
        this.usersService.user_is_available_bs.subscribe((user_available) => {
            this.IS_AVAILABLE = user_available;
            console.log('!!! SIDEBAR - USER IS AVAILABLE ', this.IS_AVAILABLE);
        });
    }

    getProjectUserId() {
        this.usersService.project_user_id_bs.subscribe((projectUser_id) => {
            console.log('SIDEBAR - PROJECT-USER-ID ', projectUser_id);
            this.projectUser_id = projectUser_id;
        });
    }

    changeAvailabilityState(IS_AVAILABLE) {
        console.log('SB - CHANGE STATUS - USER IS AVAILABLE ? ', IS_AVAILABLE);
        console.log('SB - CHANGE STATUS - PROJECT USER ID: ', this.projectUser_id);

        this.usersService.updateProjectUser(this.projectUser_id, IS_AVAILABLE).subscribe((projectUser: any) => {
            console.log('PROJECT-USER UPDATED ', projectUser)

            // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
            this.usersService.availability_btn_clicked(true)

        }, (error) => {
            console.log('PROJECT-USER UPDATED ERR  ', error);
            // =========== NOTIFY ERROR ===========
            // this.notify.showNotification('An error occurred while updating status', 4, 'report_problem');
            this.notify.showNotification(this.changeAvailabilityErrorNoticationMsg, 4, 'report_problem');

        }, () => {
            console.log('PROJECT-USER UPDATED  * COMPLETE *');

            // =========== NOTIFY SUCCESS===========
            // this.notify.showNotification('status successfully updated', 2, 'done');
            this.notify.showNotification(this.changeAvailabilitySuccessNoticationMsg, 2, 'done');


            // this.getUserAvailability()
        });
    }

    // IF THE AVAILABILITY STATUS IS CHANGED from THE USER.COMP AVAILABLE / UNAVAILABLE TOGGLE BTN
    // RE-RUN getAllUsersOfCurrentProject TO UPDATE AVAILABLE / UNAVAILABLE BTN ON THE TOP OF THE SIDEBAR
    hasChangedAvailabilityStatusInUsersComp() {
        this.usersService.has_changed_availability_in_users.subscribe((has_changed_availability) => {
            console.log('SIDEBAR SUBSCRIBES TO HAS CHANGED AVAILABILITY FROM THE USERS COMP', has_changed_availability)

            if (this.project) {
                this.getProjectUser()
            }
        })

    }
    // NO MORE USED - SUBSTITUDED WITH changeAvailabilityState
    // availale_unavailable_status(hasClickedChangeStatus: boolean) {
    //     hasClickedChangeStatus = hasClickedChangeStatus;
    //     if (hasClickedChangeStatus) {
    //         //   this.display = 'block';

    //         this.IS_AVAILABLE = hasClickedChangeStatus
    //         console.log('HAS CLICKED CHANGE STATUS - IS_AVAILABLE ? ', this.IS_AVAILABLE);
    //     }

    //     if (!hasClickedChangeStatus) {
    //         //   this.display = 'none';
    //         console.log('HAS CLICKED CHANGE STATUS ', hasClickedChangeStatus);
    //         this.IS_AVAILABLE = hasClickedChangeStatus
    //         console.log('HAS CLICKED CHANGE STATUS - IS_AVAILABLE ? ', this.IS_AVAILABLE);
    //     }
    // }


    // GET CURRENT PROJECT - IF IS DEFINED THE CURRENT PROJECT GET THE PROJECTUSER
    getCurrentProject() {
        this.auth.project_bs.subscribe((project) => {
            this.project = project
            console.log('00 -> SIDEBAR project from AUTH service subscription  ', this.project)

            if (this.project) {
                this.projectId = this.project._id

                // IS USED TO GET THE PROJECT-USER AND DETERMINE IF THE USER IS AVAILAVLE / UNAVAILABLE
                // WHEN THE PAGE IS REFRESHED
                this.getProjectUser();
            }
        });
    }

    getLoggedUser() {
        this.auth.user_bs.subscribe((user) => {
            console.log('USER GET IN SIDEBAR ', user)
            // tslint:disable-next-line:no-debugger
            // debugger
            this.user = user;

            if (user) {
                this.currentUserId = user._id;
                console.log('Current USER ID ', this.currentUserId)
            }
        });
    }

    // *** NOTE: THE SAME CALLBACK IS RUNNED IN THE HOME.COMP ***
    getProjectUser() {
        console.log('!!! SIDEBAR CALL GET-PROJECT-USER')
        this.usersService.getProjectUsersByProjectIdAndUserId(this.currentUserId, this.projectId).subscribe((projectUser: any) => {
            console.log('SB PROJECT-USER GET BY PROJECT-ID ', this.projectId);
            console.log('SB PROJECT-USER GET BY CURRENT-USER-ID ', this.user._id);
            console.log('SB PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID ', projectUser);
            console.log('SB PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID LENGTH', projectUser.length);
            if ((projectUser) && (projectUser.length !== 0)) {
                console.log('SB PROJECT-USER ID ', projectUser[0]._id)
                console.log('SB USER IS AVAILABLE ', projectUser[0].user_available)
                // this.user_is_available_bs = projectUser.user_available;

                if (projectUser[0].user_available !== undefined) {
                    this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available)
                }

                // ADDED 21 AGO
                if (projectUser[0].role !== undefined) {
                    console.log('!!! »» SIDEBAR GET PROJECT USER ROLE FOR THE PROJECT ', this.projectId, ' »» ', projectUser[0].role);

                    // ASSIGN THE projectUser[0].role VALUE TO USER_ROLE
                    this.USER_ROLE = projectUser[0].role;

                    // SEND THE ROLE TO USER SERVICE THAT PUBLISH
                    this.usersService.user_role(projectUser[0].role);



                    // save the user role in storage - then the value is get by auth.service:
                    // the user with agent role can not access to the pages under the settings sub-menu
                    // this.auth.user_role(projectUser[0].role);

                    // this.usersLocalDbService.saveUserRoleInStorage(projectUser[0].role);
                }
            } else {
                // this could be the case in which the current user was deleted as a member of the current project
                console.log('SB PROJECT-USER UNDEFINED ')
            }

        }, (error) => {
            console.log('SB PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID  ', error);
        }, () => {
            console.log('SB PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
        });
    }




    ngAfterViewInit() {
        // this.checkForUnathorizedRoute();

        //     this.SETTINGS_SUBMENU_WAS_OPEN = localStorage.getItem('show_settings_submenu')
        //     console.log('LOCAL STORAGE VALUE OF KEY show_settings_submenu: ', localStorage.getItem('show_settings_submenu'))

        //     if (this.SETTINGS_SUBMENU_WAS_OPEN === 'true') {
        //         console.log(' XXXXX ', this.SETTINGS_SUBMENU_WAS_OPEN)
        //         this.trasform = 'rotate(180deg)';

        //     } else {
        //         this.trasform = 'none';
        //         console.log(' XXXXX ', this.SETTINGS_SUBMENU_WAS_OPEN)
        //     }

    }
    isMobileMenu() {
        if ($(window).width() > 991) {
            this.IS_MOBILE_MENU = false

            // console.log('SIDEBAR - IS MOBILE MENU ', this.IS_MOBILE_MENU);

            return false;
        }
        this.IS_MOBILE_MENU = true

        // console.log('SIDEBAR - IS MOBILE MENU ', this.IS_MOBILE_MENU);

        return true;
    };

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        // console.log('SIDEBAR - WINDOW WIDTH ON RESIZE', event.target.innerWidth);
        if (event.target.innerWidth > 991) {
            this.IS_MOBILE_MENU = false

        } else {
            this.IS_MOBILE_MENU = true
        }

    }

    onScroll(event: any): void {
        console.log('SIDEBAR RICHIAMO ON SCROLL ');
        this.elSidebarWrapper = <HTMLElement>document.querySelector('.sidebar-wrapper');
        this.scrollpos = this.elSidebarWrapper.scrollTop
        console.log('SIDEBAR SCROLL POSITION', this.scrollpos)
    }
    stopScroll() {
        // const el = <HTMLElement>document.querySelector('.sidebar-wrapper');
        console.log('SIDEBAR SCROLL TO', this.scrollpos)

        if (this.elSidebarWrapper) {
            this.elSidebarWrapper.scrollTop = this.scrollpos;
        }
    }

    goToProjects() {
        console.log('SIDEBAR IS MOBILE -  HAS CLICCKED GO TO PROJECT  ')
        this.router.navigate(['/projects']);

        // (in AUTH SERVICE ) RESET PROJECT_BS AND REMOVE ITEM PROJECT FROM STORAGE WHEN THE USER GO TO PROJECTS PAGE
        this.auth.hasClickedGoToProjects()
        console.log('00 -> SIDEBAR IS MOBILE project AFTER GOTO PROJECTS ', this.project)
    }

    has_clicked_settings(SHOW_SETTINGS_SUBMENU: boolean) {
        this.SHOW_SETTINGS_SUBMENU = SHOW_SETTINGS_SUBMENU;
        console.log('HAS CLICKED SETTINGS - SHOW_SETTINGS_SUBMENU ', this.SHOW_SETTINGS_SUBMENU);

        // SAVE IN 'show_settings_submenu' KEY OF LOCAL STORAGE THE VALUE OF this.SHOW_SETTINGS_SUBMENU
        // (IS USED TO DISPLAY / HIDE THE SUBMENU WHEN THE PAGE IS REFRESHED)
        localStorage.setItem('show_settings_submenu', `${this.SHOW_SETTINGS_SUBMENU}`);

        if (this.SHOW_SETTINGS_SUBMENU === true) {
            this.trasform = 'rotate(180deg)';
        } else {
            this.trasform = 'none';
        }
    }

    // USED FOR SIDEBAR IN MOBILE MODE (TOGGLE THE CARET OF THE 'PROJECT NAME' DROPDOWN-MENU)
    has_cliked_hidden_project(SHOW_PRJCT_SUB) {
        console.log('HAS CLICKED PROJECT NAME ON MOBILE - SHOW SUBMENU ', this.SHOW_PRJCT_SUB);
        if (this.SHOW_PRJCT_SUB === true) {
            this.trasform_projectname_caret = 'rotate(180deg)';
        } else {
            this.trasform_projectname_caret = 'none';
        }
    }

    // USED FOR SIDEBAR IN MOBILE MODE (TOGGLE THE CARET OF THE 'NAME OF THE CURRENT USER' DROPDOWN-MENU)
    has_cliked_hidden_profile(SHOW_PROFILE_SUB) {
        console.log('HAS CLICKED NAME OF THE CURRENT USER ON MOBILE - SHOW SUBMENU ', this.SHOW_PRJCT_SUB);
        if (this.SHOW_PROFILE_SUB === true) {
            this.transform_user_profile_caret = 'rotate(180deg)';
        } else {
            this.transform_user_profile_caret = 'none';
        }
    }

    // NO MORE USED
    // setActiveClassToSettings() {
    //     this.isActive = 'active';
    //     console.log('HAS CLICKED SET ACTIVE TO SETTINGS MENU ITEM ', this.isActive);
    // }


    // !! NO MORE USED
    // setUnavailableAndlogout() {
    //     console.log('PRESSED SIDEBAR LOGOUT  - PRJ-USER ID ', this.projectUser_id)
    //     if (this.projectUser_id) {
    //         this.usersService.updateProjectUser(this.projectUser_id, false).subscribe((projectUser: any) => {
    //             console.log('PROJECT-USER UPDATED ', projectUser)
    //         },
    //             (error) => {
    //                 console.log('PROJECT-USER UPDATED ERR  ', error);
    //             },
    //             () => {
    //                 console.log('PROJECT-USER UPDATED  * COMPLETE *');
    //                 this.logout();
    //             });
    //     } else {
    //         // this could be the case in which the current user was deleted as a member of the current project
    //         console.log('PRESSED SIDEBAR LOGOUT - PRJ-USER IS NOT DEFINED - RUN ONLY THE LOGOUT')
    //         this.logout();
    //     }
    // }

    openLogoutModal() {
        this.displayLogoutModal = 'block';
    }

    onCloseModal() {
        this.displayLogoutModal = 'none';
    }

    onCloseLogoutModalHandled() {
        this.displayLogoutModal = 'none';
    }

    onLogoutModalHandled() {
        this.logout();
        this.displayLogoutModal = 'none';
    }

    logout() {
        this.auth.showExpiredSessionPopup(false);
        this.auth.signOut();

    }

    // RESOLVE THE BUG 'chat button remains focused after clicking'
    // SET IN THE STORAGE THAT THE CHAT HAS BEEN OPENED
    removeChatBtnFocus() {

        this.notify.publishHasClickedChat(true);

        // localStorage.setItem('chatOpened', 'true');
        this.elementRef.nativeElement.blur();
    }

    // SE IMPLEMENTATO NELL 'AFTER VIEW INIT' RITORNA ERRORE:
    // Cannot read property 'nativeElement' of undefined
    // PER ORA LO COMMENTO NELL 'AFTER VIEW INIT'
    checkForUnathorizedRoute() {
        this.router.events.subscribe((val) => {
            if (this.location.path() !== '') {
                this.checked_route = this.location.path();
                console.log('!! »»» SIDEBAR CHECKED ROUTE ', this.checked_route)
                if (this.checked_route.indexOf('/unauthorized') !== -1) {

                    // RESOLVE THE BUG 'HOME button remains focused WHEN AN USER WITH AGENT ROLE TRY TO ACCESS TO AN UNATHORIZED PAGE 
                    // IS REDIRECTED TO THE unauthorized page
                    this.homeBtnElement.nativeElement.blur();
                }
            }
        })
    }

    mouseOver(_isOverAvar: boolean) {
        this.isOverAvar = _isOverAvar
        // console.log('Mouse Over Avatar Container ', _isOverAvar)
    }

}
