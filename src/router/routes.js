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
    meta: { title },
  };
  if (requiresAuth) {
    route.meta.requiresAuth = true;
  }
  return route;
};

export default [
  {
    path: "/",
    redirect: "/login",
  },
  createRoute("/login", "login", "LoginView", false, "Login"),
  createRoute("/dashboard", "dashboard", "HomeView", true, "Dashboard"),
  createRoute("/books", "books", "BooksView", true, "Libros"),
  createRoute(
    "/categories",
    "categories",
    "CategoriesView",
    true,
    "Categorias"
  ),
  createRoute("/authors", "authors", "AuthorView", true, "Autores"),
  createRoute(
    "/publishers",
    "publishers",
    "PublishersView",
    true,
    "Editoriales"
  ),
  createRoute("/languages", "languages", "LanguagesView", true, "Lenguajes"),
  createRoute("/requests", "requests", "RequestsView", true, "Solicitudes"),
  createRoute(
    "/requestsAdmin",
    "requestsAdmin",
    "AdminRequestView",
    true,
    "Solicitudes pendientes"
  ),
  createRoute("/forms", "forms", "FormsView", true, "Forms"),
  createRoute("/authorForm", "authorForm", "AuthorForm", true, "Nuevo Autor"),
  createRoute(
    "/languageForm",
    "languageForm",
    "LanguageForm",
    true,
    "Nuevo Lenguaje"
  ),
  createRoute(
    "/publisherForm",
    "publisherForm",
    "PublisherForm",
    true,
    "Nueva Editorial"
  ),
  createRoute(
    "/categoryForm",
    "categoryForm",
    "CategoryForm",
    true,
    "Nueva Categoria"
  ),
  createRoute(
    "/requestForm",
    "requestForm",
    "RequestForm",
    true,
    "Nueva Solicitud"
  ),
  createRoute("/newBook", "newBook", "BookForm", true, "Nuevo Libro"),
  createRoute("/profile", "profile", "ProfileView", true, "Profile"),
  createRoute("/ui", "ui", "UiView", true, "Ui"),
  createRoute(
    "/responsive",
    "responsive",
    "ResponsiveView",
    true,
    "Responsive layout"
  ),
  createRoute("/error", "error", "ErrorView", false, "Error"),
];
