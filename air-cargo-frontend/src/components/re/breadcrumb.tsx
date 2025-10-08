import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
import { Fragment } from "react/jsx-runtime";

export const BreadcrumbWrapper = ({ path }: { path: string }) => {
  const splittedPath = path.split("/");
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {splittedPath.map((p, idx) => {
          return idx !== splittedPath.length - 1 ? (
            <Fragment key={idx}>
              <BreadcrumbItem>
                <BreadcrumbLink href={p.toLowerCase()}>{p}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ) : (
            <BreadcrumbItem key={idx}>
              <BreadcrumbLink href={p.toLowerCase()}>{p}</BreadcrumbLink>
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
