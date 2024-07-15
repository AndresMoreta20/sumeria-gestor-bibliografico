import { authGuard } from "@/utils/authGuard";

const createRoute = (
  path,
  name,
  componentPath,
  requiresAuth = false,
  title = ""
) => {
  const route = {
    path,
    name,
    component: () => import(`@/views/${componentPath}.vue`),
    meta: { title, requiresAuth },
    beforeEnter: requiresAuth ? authGuard : undefined,
  };
  return route;
};
const routeDefinitions = [
  {
    path: "/login",
    name: "login",
    componentPath: "LoginView",
    requiresAuth: false,
    title: "Login",
  },
  {
    path: "/books",
    name: "books",
    componentPath: "BooksView",
    requiresAuth: true,
    title: "Libros",
  },
  {
    path: "/dashboard",
    name: "dashboard",
    componentPath: "HomeView",
    requiresAuth: true,
    title: "Dashboard",
  },

  {
    path: "/categories",
    name: "categories",
    componentPath: "CategoriesView",
    requiresAuth: true,
    title: "Categorias",
  },
  {
    path: "/authors",
    name: "authors",
    componentPath: "AuthorView",
    requiresAuth: true,
    title: "Autores",
  },
  {
    path: "/publishers",
    name: "publishers",
    componentPath: "PublishersView",
    requiresAuth: true,
    title: "Editoriales",
  },
  {
    path: "/publisher-form",
    name: "newPublisher",
    componentPath: "PublisherRequestForm",
    title: "Editorial",
  },
  {
    path: "/languages",
    name: "languages",
    componentPath: "LanguagesView",
    requiresAuth: true,
    title: "Lenguajes",
  },
  {
    path: "/requests",
    name: "requests",
    componentPath: "RequestsView",
    requiresAuth: true,
    title: "Solicitudes",
  },
  {
    path: "/requestsAdmin",
    name: "requestsAdmin",
    componentPath: "AdminRequestView",
    requiresAuth: true,
    title: "Solicitudes pendientes",
  },
  {
    path: "/publisher-requests",
    name: "publisherRequests",
    componentPath: "PublisherRequestsView",
    requiresAuth: true,
    title: "Solicitudes pendientes",
  },
  {
    path: "/publisher-check/:id",
    name: "PublisherCheckView",
    componentPath: "PublisherCheckView",
    requiresAuth: true,
    title: "Nueva editorial",
  },
  {
    path: "/publisherBooksView",
    name: "publisherBooksView",
    componentPath: "PublisherBooksView",
    requiresAuth: true,
    title: "Mis libros",
  },
  {
    path: "/forms",
    name: "forms",
    componentPath: "FormsView",
    requiresAuth: true,
    title: "Forms",
  },
  {
    path: "/authorForm",
    name: "authorForm",
    componentPath: "AuthorForm",
    requiresAuth: true,
    title: "Nuevo Autor",
  },
  {
    path: "/languageForm",
    name: "languageForm",
    componentPath: "LanguageForm",
    requiresAuth: true,
    title: "Nuevo Lenguaje",
  },
  {
    path: "/category/new",
    name: "categoryForm",
    componentPath: "CategoryForm",
    requiresAuth: true,
    title: "Nueva Categoría",
  },
  {
    path: "/publisherForm",
    name: "publisherForm",
    componentPath: "PublisherForm",
    requiresAuth: true,
    title: "Nueva Editorial",
  },
  {
    path: "/categoryForm/edit/:id",
    name: "categoryEditForm",
    componentPath: "CategoryForm",
    requiresAuth: true,
    props: true,
    title: "Nueva Categoria",
  },
  {
    path: "/categoryForm/new",
    name: "categoryNewForm",
    componentPath: "CategoryForm",
    requiresAuth: true,
    title: "Nueva Categoria",
  },
  {
    path: "/requestForm",
    name: "requestForm",
    componentPath: "RequestForm",
    requiresAuth: true,
    title: "Nueva Solicitud",
  },
  {
    path: "/changePassword",
    name: "changePassword",
    componentPath: "ChangePassword",
    requiresAuth: true,
    title: "Actualiza tu contraseña",
  },
  {
    path: "/requestDetailView/:id",
    name: "requestDetailView",
    componentPath: "RequestDetailView",
    props: true,
    requiresAuth: true,
    title: "Revisar Solicitud",
  },
  {
    path: "/readOnlyRequestDetailView/:id",
    name: "readOnlyRequestDetailView",
    componentPath: "ReadOnlyRequestDetailView",
    props: true,
    requiresAuth: true,
    title: "Revisar Solicitud",
  },

  {
    path: "/newBook",
    name: "newBook",
    componentPath: "BookForm",
    requiresAuth: true,
    title: "Nuevo Libro",
  },
  {
    path: "/profile",
    name: "profile",
    componentPath: "ProfileView",
    requiresAuth: true,
    title: "Profile",
  },
  {
    path: "/ui",
    name: "ui",
    componentPath: "UiView",
    requiresAuth: true,
    title: "Ui",
  },
  {
    path: "/responsive",
    name: "responsive",
    componentPath: "ResponsiveView",
    requiresAuth: true,
    title: "Responsive layout",
  },
  {
    path: "/error",
    name: "error",
    componentPath: "ErrorView",
    requiresAuth: false,
    title: "Error",
  },
];

export default [
  { path: "/", redirect: "/login" },
  ...routeDefinitions.map((route) =>
    createRoute(
      route.path,
      route.name,
      route.componentPath,
      route.requiresAuth,
      route.title
    )
  ),
];
