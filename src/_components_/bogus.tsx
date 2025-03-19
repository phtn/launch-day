export const Bogus = () => {
  return (
    <div className="w-full grid gap-4 md:grid-rows-2 col-span-2 h-[calc(100vh-80px)] overflow-scroll md:h-[calc((100vh)-116px)]">
      <div className="w-full h-screen md:h-full gap-4 grid grid-cols-1 md:grid-cols-1">
        <div className="size-fit lg:size-full grid p-4 grid-cols-3 border-[0.33px] border-gray-500/60"></div>

        {/* <div className="size-fit lg:size-full grid p-4 grid-cols-3 border-t-[0.33px] border-gray-500/60">
          {backends.map((link) => (
            <Starlink key={link.id} {...link} />
          ))}
        </div> */}
      </div>
      <div className="w-full h-96 flex items-center justify-center">Yo</div>
    </div>
  );
};

// const Starlink = (link: StarlinkData) => (
//   <div className="flex justify-center items-center">
//     <Pentagon icon={link.icon} href={link.href} />
//   </div>
// );
